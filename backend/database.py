from sqlmodel import SQLModel, create_engine, Session

sqlite_file_name = "reviews.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    migrate_db()

def migrate_db():
    from sqlalchemy import text
    with Session(engine) as session:
        # Check if helper columns exist, if not add them
        try:
            session.exec(text("ALTER TABLE review ADD COLUMN sentiment VARCHAR"))
            session.commit()
            print("Migrated: Added sentiment column")
        except Exception:
            pass # Column likely exists

        try:
            session.exec(text("ALTER TABLE review ADD COLUMN aspects VARCHAR"))
            session.commit()
            print("Migrated: Added aspects column")
        except Exception:
            pass # Column likely exists

def get_session():
    with Session(engine) as session:
        yield session
