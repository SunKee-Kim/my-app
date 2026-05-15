from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import organization, user, common_code, menu, screen_button, permission

Base.metadata.create_all(bind=engine)

app = FastAPI(title="System Admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(organization.router)
app.include_router(user.router)
app.include_router(common_code.router)
app.include_router(menu.router)
app.include_router(screen_button.router)
app.include_router(permission.router)


@app.get("/")
def root():
    return {"message": "System Admin API"}
