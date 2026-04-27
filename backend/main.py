from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List

# Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./academic.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default="student")
    
    scores = relationship("MockExam", back_populates="user")

class MockExam(Base):
    __tablename__ = "mock_exams"
    id = Column(Integer, primary_key=True, index=True)
    score = Column(Float)
    subject = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="scores")

# Pydantic Schemas
class MockExamCreate(BaseModel):
    user_id: int
    score: float
    subject: str

class MockExamResponse(BaseModel):
    id: int
    score: float
    subject: str
    user_id: int

    class Config:
        from_attributes = True

# FastAPI App
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Startup Event
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# Endpoints
@app.get("/")
def read_root():
    return {"message": "Welcome to the Academic Network API"}

@app.post("/scores/", response_model=MockExamResponse)
def create_score(exam: MockExamCreate, db: Session = Depends(get_db)):
    # Auto-create dummy user for easy testing if not exists
    user = db.query(User).filter(User.id == exam.user_id).first()
    if not user:
        dummy_user = User(id=exam.user_id, name=f"User {exam.user_id}", email=f"user{exam.user_id}@example.com")
        db.add(dummy_user)
        db.commit()
        db.refresh(dummy_user)

    db_exam = MockExam(score=exam.score, subject=exam.subject, user_id=exam.user_id)
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

@app.get("/users/{user_id}/scores", response_model=List[MockExamResponse])
def get_user_scores(user_id: int, db: Session = Depends(get_db)):
    scores = db.query(MockExam).filter(MockExam.user_id == user_id).all()
    return scores

from recommendation_engine import generate_diagnostic

@app.get("/api/diagnostic")
def get_diagnostic(
    math: float = 0.0,
    sciences: float = 0.0,
    humanities: float = 0.0,
    languages: float = 0.0
):
    scores = {
        "Math": math,
        "Sciences": sciences,
        "Humanities": humanities,
        "Languages": languages
    }
    target_cutoffs = {
        "Math": 70.0,
        "Sciences": 70.0,
        "Humanities": 70.0,
        "Languages": 70.0
    }
    return generate_diagnostic(scores, target_cutoffs)
