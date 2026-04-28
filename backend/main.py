from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
from jose import jwt, JWTError
from security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM

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
    hashed_password = Column(String)
    role = Column(String, default="student")
    
    scores = relationship("MockExam", back_populates="user")
    threads = relationship("ForumThread", back_populates="author")
    comments = relationship("ForumComment", back_populates="author")

class MockExam(Base):
    __tablename__ = "mock_exams"
    id = Column(Integer, primary_key=True, index=True)
    score = Column(Float)
    subject = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="scores")

class ForumThread(Base):
    __tablename__ = "forum_threads"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    author = relationship("User", back_populates="threads")
    comments = relationship("ForumComment", back_populates="thread")

class ForumComment(Base):
    __tablename__ = "forum_comments"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    thread_id = Column(Integer, ForeignKey("forum_threads.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    thread = relationship("ForumThread", back_populates="comments")
    author = relationship("User", back_populates="comments")


# Pydantic Schemas
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

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

class ForumThreadCreate(BaseModel):
    title: str
    content: str

class ForumThreadResponse(BaseModel):
    id: int
    title: str
    content: str
    author_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ForumCommentCreate(BaseModel):
    content: str

class ForumCommentResponse(BaseModel):
    id: int
    content: str
    thread_id: int
    author_id: int
    created_at: datetime

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

# Dependencies
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


# Startup Event
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


# Endpoints
@app.post("/api/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(name=user.name, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User successfully created"}

@app.post("/api/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/mock-exams", response_model=MockExamResponse)
def create_mock_exam(exam: MockExamCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_exam = MockExam(score=exam.score, subject=exam.subject, user_id=current_user.id)
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

@app.get("/api/mock-exams", response_model=List[MockExamResponse])
def get_all_mock_exams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(MockExam).filter(MockExam.user_id == current_user.id).all()


@app.post("/api/forum/threads", response_model=ForumThreadResponse)
def create_forum_thread(thread: ForumThreadCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_thread = ForumThread(
        title=thread.title, 
        content=thread.content, 
        author_id=current_user.id
    )
    db.add(db_thread)
    db.commit()
    db.refresh(db_thread)
    return db_thread

@app.get("/api/forum/threads", response_model=List[ForumThreadResponse])
def get_forum_threads(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ForumThread).order_by(ForumThread.created_at.desc()).all()


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
