from sqlalchemy.orm import Session
from main import SessionLocal, User, MockExam, Base, engine

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_database():
    db: Session = SessionLocal()
    try:
        # Check if user already exists
        user = db.query(User).filter(User.email == 'student@enem.com').first()
        if not user:
            user = User(name='Test Student', email='student@enem.com', role='student')
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Clear old exams for this user if they exist, so we only have the clean 4
        db.query(MockExam).filter(MockExam.user_id == user.id).delete()
        
        exams = [
            MockExam(score=85.0, subject='Math', user_id=user.id),
            MockExam(score=65.0, subject='Sciences', user_id=user.id),
            MockExam(score=90.0, subject='Humanities', user_id=user.id),
            MockExam(score=75.0, subject='Languages', user_id=user.id),
        ]
        db.add_all(exams)
        db.commit()
        print("Database seeded successfully with ENEM mock exams!")
            
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
