Now building the complete backend server.py:
Action: file_editor create /app/backend/server.py --file-text "\"\"\"
SitePilot - Construction Management Platform
FastAPI Backend with all modules: Auth, Projects, Daily Reports, Materials, Photos,
RFIs, Submittals, Cost Management, Safety, Resources, Documents, Punch Lists, Meetings,
Tasks, Chat, Notifications, Dashboard, AI Assistant
\"\"\"

import os
import uuid
import json
import re
import shutil
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

# ─── Configuration ──────────────────────────────────────────────────────────
MONGO_URL = os.environ.get(\"MONGO_URL\", \"mongodb://localhost:27017\")
DB_NAME = os.environ.get(\"DB_NAME\", \"sitepilot_db\")
JWT_SECRET = os.environ.get(\"JWT_SECRET\", \"sitepilot_super_secret_key_2024\")
JWT_ALGORITHM = os.environ.get(\"JWT_ALGORITHM\", \"HS256\")
JWT_EXPIRE_HOURS = 720  # 30 days
EMERGENT_LLM_KEY = os.environ.get(\"EMERGENT_LLM_KEY\")

# ─── App Setup ──────────────────────────────────────────────────────────────
app = FastAPI(title=\"SitePilot API\", version=\"1.0.0\")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[\"*\"],
    allow_credentials=True,
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# Uploads directory
UPLOADS_DIR = Path(\"/app/backend/uploads\")
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount(\"/uploads\", StaticFiles(directory=str(UPLOADS_DIR)), name=\"uploads\")

# ─── DB ─────────────────────────────────────────────────────────────────────
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ─── Security ───────────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=[\"bcrypt\"], deprecated=\"auto\")
security = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(data: dict) -> str:
    payload = data.copy()
    payload[\"exp\"] = datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def serialize_doc(doc) -> dict:
    \"\"\"Convert MongoDB document to JSON-serializable dict\"\"\"
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == \"_id\":
            result[\"id\"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, list):
            result[key] = [serialize_doc(v) if isinstance(v, dict) else
                           (str(v) if isinstance(v, ObjectId) else
                            (v.isoformat() if isinstance(v, datetime) else v))
                           for v in value]
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        else:
            result[key] = value
    return result


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get(\"sub\")
        if not user_id:
            raise HTTPException(status_code=401, detail=\"Invalid token\")
        user = await db.users.find_one({\"_id\": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail=\"User not found\")
        return serialize_doc(user)
    except (JWTError, Exception) as e:
        raise HTTPException(status_code=401, detail=f\"Invalid token: {str(e)}\")


# ─── Pydantic Models ─────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = \"gc\"  # gc|sub|owner|specialty|admin
    company: str = \"\"
    phone: str = \"\"

class LoginRequest(BaseModel):
    email: str
    password: str

class ProjectCreate(BaseModel):
    name: str
    number: str = \"\"
    description: str = \"\"
    location: str = \"\"
    address: str = \"\"
    start_date: str = \"\"
    end_date: str = \"\"
    budget: float = 0
    status: str = \"active\"
    phase: str = \"Construction\"
    client_name: str = \"\"
    contract_type: str = \"Lump Sum\"
    manager_name: str = \"\"

class DailyReportCreate(BaseModel):
    project_id: str
    date: str
    weather: str = \"Clear\"
    temperature: str = \"\"
    work_performed: str = \"\"
    workers_count: int = 0
    work_areas: List[str] = []
    materials_used: List[dict] = []
    equipment_used: List[str] = []
    issues: List[str] = []
    safety_observations: List[str] = []
    visitors: List[str] = []
    next_day_plan: str = \"\"
    status: str = \"submitted\"

class RFICreate(BaseModel):
    project_id: str
    title: str
    description: str = \"\"
    spec_section: str = \"\"
    drawing_ref: str = \"\"
    location: str = \"\"
    assigned_to: str = \"\"
    due_date: str = \"\"
    priority: str = \"medium\"

class SubmittalCreate(BaseModel):
    project_id: str
    title: str
    spec_section: str = \"\"
    description: str = \"\"
    reviewer: str = \"\"
    due_date: str = \"\"
    revision_number: int = 0

class ChangeOrderCreate(BaseModel):
    project_id: str
    title: str
    description: str = \"\"
    reason: str = \"\"
    amount: float = 0
    impact_schedule_days: int = 0

class BudgetUpdate(BaseModel):
    original_budget: float = 0
    budget_items: List[dict] = []

class SafetyObservationCreate(BaseModel):
    project_id: str
    date: str = \"\"
    location: str = \"\"
    type: str = \"unsafe\"
    description: str = \"\"
    severity: str = \"medium\"
    assigned_to: str = \"\"
    corrective_action: str = \"\"

class IncidentCreate(BaseModel):
    project_id: str
    date: str = \"\"
    time: str = \"\"
    location: str = \"\"
    type: str = \"near_miss\"
    description: str = \"\"
    injured_party: str = \"\"
    body_part: str = \"\"
    root_cause: str = \"\"
    corrective_actions: List[str] = []

class InspectionCreate(BaseModel):
    project_id: str
    type: str = \"daily\"
    title: str = \"\"
    date: str = \"\"
    location: str = \"\"
    items: List[dict] = []
    notes: str = \"\"

class CrewCreate(BaseModel):
    project_id: str
    name: str
    trade: str = \"\"
    company: str = \"\"
    lead_name: str = \"\"
    count: int = 1
    start_date: str = \"\"
    end_date: str = \"\"
    daily_rate: float = 0

class EquipmentCreate(BaseModel):
    project_id: str
    name: str
    type: str = \"\"
    model: str = \"\"
    operator: str = \"\"
    rental_company: str = \"\"
    delivery_date: str = \"\"
    removal_date: str = \"\"
    daily_rate: float = 0
    status: str = \"active\"

class TimesheetCreate(BaseModel):
    project_id: str
    worker_name: str
    date: str = \"\"
    hours: float = 8
    trade: str = \"\"
    cost_code: str = \"\"
    notes: str = \"\"

class DocumentCreate(BaseModel):
    project_id: str
    title: str
    type: str = \"drawing\"
    number: str = \"\"
    revision: str = \"0\"
    discipline: str = \"\"
    description: str = \"\"
    tags: List[str] = []

class PunchListItemCreate(BaseModel):
    project_id: str
    title: str
    description: str = \"\"
    location: str = \"\"
    trade: str = \"\"
    assigned_to: str = \"\"
    due_date: str = \"\"
    priority: str = \"medium\"

class MeetingCreate(BaseModel):
    project_id: str
    title: str
    type: str = \"weekly\"
    date: str = \"\"
    time: str = \"\"
    location: str = \"\"
    attendees: List[str] = []
    agenda: List[str] = []
    minutes: str = \"\"
    action_items: List[dict] = []

class TaskCreate(BaseModel):
    project_id: str = \"\"
    title: str
    description: str = \"\"
    assigned_to: str = \"\"
    due_date: str = \"\"
    priority: str = \"medium\"
    tags: List[str] = []

class ChatMessageCreate(BaseModel):
    project_id: str = \"\"
    message: str

class AIRequest(BaseModel):
    prompt: str
    context: str = \"\"
    type: str = \"general\"  # general|daily_report|risk|rfi|summary

class UpdateStatusRequest(BaseModel):
    status: str

class ProfileUpdate(BaseModel):
    name: str = \"\"
    phone: str = \"\"
    company: str = \"\"

# ─── Helper to get next sequence number ─────────────────────────────────────
async def get_next_number(collection: str, project_id: str, prefix: str) -> str:
    count = await db[collection].count_documents({\"project_id\": project_id})
    return f\"{prefix}-{str(count + 1).zfill(4)}\"


# ═══════════════════════════════════════════════════════════════════════════
# AUTH ROUTES
# ═══════════════════════════════════════════════════════════════════════════

@app.post(\"/api/auth/register\")
async def register(body: RegisterRequest):
    existing = await db.users.find_one({\"email\": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail=\"Email already registered\")
    user_doc = {
        \"name\": body.name,
        \"email\": body.email.lower(),
        \"password_hash\": hash_password(body.password),
        \"role\": body.role,
        \"company\": body.company,
        \"phone\": body.phone,
        \"avatar\": \"\",
        \"is_active\": True,
        \"created_at\": datetime.utcnow()
    }
    result = await db.users.insert_one(user_doc)
    user_doc[\"_id\"] = result.inserted_id
    token = create_token({\"sub\": str(result.inserted_id), \"role\": body.role})
    return {\"token\": token, \"user\": serialize_doc(user_doc)}


@app.post(\"/api/auth/login\")
async def login(body: LoginRequest):
    user = await db.users.find_one({\"email\": body.email.lower()})
    if not user or not verify_password(body.password, user.get(\"password_hash\", \"\")):
        raise HTTPException(status_code=401, detail=\"Invalid email or password\")
    token = create_token({\"sub\": str(user[\"_id\"]), \"role\": user.get(\"role\", \"gc\")})
    return {\"token\": token, \"user\": serialize_doc(user)}


@app.get(\"/api/auth/me\")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@app.put(\"/api/auth/profile\")
async def update_profile(body: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in body.dict().items() if v}
    await db.users.update_one({\"_id\": ObjectId(current_user[\"id\"])}, {\"$set\": update_data})
    user = await db.users.find_one({\"_id\": ObjectId(current_user[\"id\"])})
    return serialize_doc(user)


@app.get(\"/api/users\")
async def get_users(current_user: dict = Depends(get_current_user)):
    cursor = db.users.find({}, {\"password_hash\": 0})
    users = []
    async for u in cursor:
        users.append(serialize_doc(u))
    return users


# ═══════════════════════════════════════════════════════════════════════════
# PROJECTS ROUTES
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/projects\")
async def get_projects(current_user: dict = Depends(get_current_user)):
    cursor = db.projects.find({}).sort(\"created_at\", -1)
    projects = []
    async for p in cursor:
        projects.append(serialize_doc(p))
    return projects


@app.post(\"/api/projects\")
async def create_project(body: ProjectCreate, current_user: dict = Depends(get_current_user)):
    count = await db.projects.count_documents({})
    proj_doc = body.dict()
    proj_doc.update({
        \"number\": body.number or f\"SP-{str(count + 1).zfill(4)}\",
        \"progress\": 0,
        \"created_by\": current_user[\"id\"],
        \"created_by_name\": current_user[\"name\"],
        \"team\": [],
        \"created_at\": datetime.utcnow(),
        \"updated_at\": datetime.utcnow()
    })
    # Initialize budget
    await db.budgets.insert_one({
        \"project_id\": \"\",  # Will update
        \"original_budget\": body.budget,
        \"approved_changes\": 0,
        \"current_budget\": body.budget,
        \"committed_cost\": 0,
        \"actual_cost\": 0,
        \"forecasted_cost\": body.budget,
        \"budget_items\": [],
        \"created_at\": datetime.utcnow()
    })
    result = await db.projects.insert_one(proj_doc)
    proj_doc[\"_id\"] = result.inserted_id
    await db.budgets.update_one(
        {\"project_id\": \"\"},
        {\"$set\": {\"project_id\": str(result.inserted_id)}}
    )
    return serialize_doc(proj_doc)


@app.get(\"/api/projects/{project_id}\")
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    proj = await db.projects.find_one({\"_id\": ObjectId(project_id)})
    if not proj:
        raise HTTPException(status_code=404, detail=\"Project not found\")
    return serialize_doc(proj)


@app.put(\"/api/projects/{project_id}\")
async def update_project(project_id: str, body: ProjectCreate, current_user: dict = Depends(get_current_user)):
    update_data = body.dict()
    update_data[\"updated_at\"] = datetime.utcnow()
    await db.projects.update_one({\"_id\": ObjectId(project_id)}, {\"$set\": update_data})
    proj = await db.projects.find_one({\"_id\": ObjectId(project_id)})
    return serialize_doc(proj)


@app.delete(\"/api/projects/{project_id}\")
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    await db.projects.delete_one({\"_id\": ObjectId(project_id)})
    return {\"message\": \"Project deleted\"}


@app.get(\"/api/projects/{project_id}/stats\")
async def get_project_stats(project_id: str, current_user: dict = Depends(get_current_user)):
    rfi_count = await db.rfis.count_documents({\"project_id\": project_id})
    open_rfis = await db.rfis.count_documents({\"project_id\": project_id, \"status\": \"open\"})
    submittal_count = await db.submittals.count_documents({\"project_id\": project_id})
    pending_submittals = await db.submittals.count_documents({\"project_id\": project_id, \"status\": {\"$in\": [\"submitted\", \"under_review\"]}})
    punch_open = await db.punch_list.count_documents({\"project_id\": project_id, \"status\": {\"$in\": [\"open\", \"in_progress\"]}})
    incidents = await db.incidents.count_documents({\"project_id\": project_id})
    report_count = await db.daily_reports.count_documents({\"project_id\": project_id})
    budget = await db.budgets.find_one({\"project_id\": project_id})
    return {
        \"rfi_count\": rfi_count,
        \"open_rfis\": open_rfis,
        \"submittal_count\": submittal_count,
        \"pending_submittals\": pending_submittals,
        \"punch_open\": punch_open,
        \"incidents\": incidents,
        \"report_count\": report_count,
        \"budget\": serialize_doc(budget) if budget else None
    }


# ═══════════════════════════════════════════════════════════════════════════
# DAILY REPORTS
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/reports\")
async def get_all_reports(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.daily_reports.find(query).sort(\"created_at\", -1)
    reports = []
    async for r in cursor:
        reports.append(serialize_doc(r))
    return reports


@app.post(\"/api/reports\")
async def create_report(body: DailyReportCreate, current_user: dict = Depends(get_current_user)):
    count = await db.daily_reports.count_documents({\"project_id\": body.project_id})
    doc = body.dict()
    doc.update({
        \"report_number\": f\"DR-{str(count + 1).zfill(4)}\",
        \"submitted_by\": current_user[\"id\"],
        \"submitted_by_name\": current_user[\"name\"],
        \"created_at\": datetime.utcnow()
    })
    result = await db.daily_reports.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


@app.get(\"/api/reports/{report_id}\")
async def get_report(report_id: str, current_user: dict = Depends(get_current_user)):
    r = await db.daily_reports.find_one({\"_id\": ObjectId(report_id)})
    if not r:
        raise HTTPException(status_code=404, detail=\"Report not found\")
    return serialize_doc(r)


@app.put(\"/api/reports/{report_id}\")
async def update_report(report_id: str, body: DailyReportCreate, current_user: dict = Depends(get_current_user)):
    doc = body.dict()
    doc[\"updated_at\"] = datetime.utcnow()
    await db.daily_reports.update_one({\"_id\": ObjectId(report_id)}, {\"$set\": doc})
    r = await db.daily_reports.find_one({\"_id\": ObjectId(report_id)})
    return serialize_doc(r)


# ═══════════════════════════════════════════════════════════════════════════
# MATERIALS
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/materials\")
async def get_materials(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.materials.find(query).sort(\"created_at\", -1)
    materials = []
    async for m in cursor:
        materials.append(serialize_doc(m))
    return materials


@app.post(\"/api/materials\")
async def create_material(
    project_id: str = Form(...),
    name: str = Form(...),
    quantity: float = Form(0),
    unit: str = Form(\"\"),
    min_threshold: float = Form(0),
    supplier: str = Form(\"\"),
    delivery_date: str = Form(\"\"),
    invoice_no: str = Form(\"\"),
    notes: str = Form(\"\"),
    current_user: dict = Depends(get_current_user)
):
    doc = {
        \"project_id\": project_id, \"name\": name, \"quantity\": quantity,
        \"unit\": unit, \"min_threshold\": min_threshold, \"supplier\": supplier,
        \"delivery_date\": delivery_date, \"invoice_no\": invoice_no, \"notes\": notes,
        \"added_by\": current_user[\"id\"], \"created_at\": datetime.utcnow()
    }
    result = await db.materials.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


# ═══════════════════════════════════════════════════════════════════════════
# PHOTOS
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/photos\")
async def get_photos(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.photos.find(query).sort(\"created_at\", -1)
    photos = []
    async for p in cursor:
        photos.append(serialize_doc(p))
    return photos


@app.post(\"/api/photos/upload\")
async def upload_photo(
    project_id: str = Form(...),
    note: str = Form(\"\"),
    tags: str = Form(\"\"),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    ext = Path(file.filename).suffix
    filename = f\"{uuid.uuid4()}{ext}\"
    filepath = UPLOADS_DIR / filename
    with open(filepath, \"wb\") as f:
        content = await file.read()
        f.write(content)
    doc = {
        \"project_id\": project_id,
        \"filename\": filename,
        \"url\": f\"/uploads/{filename}\",
        \"note\": note,
        \"tags\": [t.strip() for t in tags.split(\",\") if t.strip()],
        \"uploaded_by\": current_user[\"id\"],
        \"uploaded_by_name\": current_user[\"name\"],
        \"size\": len(content),
        \"mime_type\": file.content_type,
        \"created_at\": datetime.utcnow()
    }
    result = await db.photos.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


@app.delete(\"/api/photos/{photo_id}\")
async def delete_photo(photo_id: str, current_user: dict = Depends(get_current_user)):
    photo = await db.photos.find_one({\"_id\": ObjectId(photo_id)})
    if photo:
        filepath = UPLOADS_DIR / photo.get(\"filename\", \"\")
        if filepath.exists():
            filepath.unlink()
        await db.photos.delete_one({\"_id\": ObjectId(photo_id)})
    return {\"message\": \"Deleted\"}


# ═══════════════════════════════════════════════════════════════════════════
# RFIs
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/rfis\")
async def get_rfis(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.rfis.find(query).sort(\"created_at\", -1)
    rfis = []
    async for r in cursor:
        rfis.append(serialize_doc(r))
    return rfis


@app.post(\"/api/rfis\")
async def create_rfi(body: RFICreate, current_user: dict = Depends(get_current_user)):
    rfi_num = await get_next_number(\"rfis\", body.project_id, \"RFI\")
    doc = body.dict()
    doc.update({
        \"rfi_number\": rfi_num,
        \"status\": \"open\",
        \"submitted_by\": current_user[\"id\"],
        \"submitted_by_name\": current_user[\"name\"],
        \"submitted_date\": datetime.utcnow().isoformat(),
        \"response\": \"\",
        \"responded_date\": \"\",
        \"impact_cost\": 0,
        \"impact_schedule\": 0,
        \"created_at\": datetime.utcnow()
    })
    result = await db.rfis.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    await create_notification_internal(
        body.project_id, \"rfi\", f\"New RFI: {rfi_num}\",
        f\"RFI '{body.title}' has been submitted\", \"medium\"
    )
    return serialize_doc(doc)


@app.put(\"/api/rfis/{rfi_id}\")
async def update_rfi(rfi_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    body[\"updated_at\"] = datetime.utcnow().isoformat()
    await db.rfis.update_one({\"_id\": ObjectId(rfi_id)}, {\"$set\": body})
    rfi = await db.rfis.find_one({\"_id\": ObjectId(rfi_id)})
    return serialize_doc(rfi)


@app.delete(\"/api/rfis/{rfi_id}\")
async def delete_rfi(rfi_id: str, current_user: dict = Depends(get_current_user)):
    await db.rfis.delete_one({\"_id\": ObjectId(rfi_id)})
    return {\"message\": \"Deleted\"}


# ═══════════════════════════════════════════════════════════════════════════
# SUBMITTALS
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/submittals\")
async def get_submittals(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.submittals.find(query).sort(\"created_at\", -1)
    subs = []
    async for s in cursor:
        subs.append(serialize_doc(s))
    return subs


@app.post(\"/api/submittals\")
async def create_submittal(body: SubmittalCreate, current_user: dict = Depends(get_current_user)):
    sub_num = await get_next_number(\"submittals\", body.project_id, \"SUB\")
    doc = body.dict()
    doc.update({
        \"submittal_number\": sub_num,
        \"status\": \"draft\",
        \"submitted_by\": current_user[\"id\"],
        \"submitted_by_name\": current_user[\"name\"],
        \"submitted_date\": \"\",
        \"notes\": \"\",
        \"created_at\": datetime.utcnow()
    })
    result = await db.submittals.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


@app.put(\"/api/submittals/{sub_id}\")
async def update_submittal(sub_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    body[\"updated_at\"] = datetime.utcnow().isoformat()
    await db.submittals.update_one({\"_id\": ObjectId(sub_id)}, {\"$set\": body})
    sub = await db.submittals.find_one({\"_id\": ObjectId(sub_id)})
    return serialize_doc(sub)


@app.delete(\"/api/submittals/{sub_id}\")
async def delete_submittal(sub_id: str, current_user: dict = Depends(get_current_user)):
    await db.submittals.delete_one({\"_id\": ObjectId(sub_id)})
    return {\"message\": \"Deleted\"}


# ═══════════════════════════════════════════════════════════════════════════
# COST MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/costs/budget/{project_id}\")
async def get_budget(project_id: str, current_user: dict = Depends(get_current_user)):
    budget = await db.budgets.find_one({\"project_id\": project_id})
    if not budget:
        doc = {
            \"project_id\": project_id,
            \"original_budget\": 0,
            \"approved_changes\": 0,
            \"current_budget\": 0,
            \"committed_cost\": 0,
            \"actual_cost\": 0,
            \"forecasted_cost\": 0,
            \"budget_items\": [],
            \"created_at\": datetime.utcnow()
        }
        r = await db.budgets.insert_one(doc)
        doc[\"_id\"] = r.inserted_id
        return serialize_doc(doc)
    return serialize_doc(budget)


@app.put(\"/api/costs/budget/{project_id}\")
async def update_budget(project_id: str, body: BudgetUpdate, current_user: dict = Depends(get_current_user)):
    await db.budgets.update_one(
        {\"project_id\": project_id},
        {\"$set\": {\"original_budget\": body.original_budget,
                  \"current_budget\": body.original_budget,
                  \"budget_items\": body.budget_items,
                  \"updated_at\": datetime.utcnow()}},
        upsert=True
    )
    budget = await db.budgets.find_one({\"project_id\": project_id})
    return serialize_doc(budget)


@app.get(\"/api/costs/change-orders\")
async def get_change_orders(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.change_orders.find(query).sort(\"created_at\", -1)
    cos = []
    async for c in cursor:
        cos.append(serialize_doc(c))
    return cos


@app.post(\"/api/costs/change-orders\")
async def create_change_order(body: ChangeOrderCreate, current_user: dict = Depends(get_current_user)):
    co_num = await get_next_number(\"change_orders\", body.project_id, \"CO\")
    doc = body.dict()
    doc.update({
        \"co_number\": co_num,
        \"status\": \"draft\",
        \"submitted_by\": current_user[\"id\"],
        \"submitted_by_name\": current_user[\"name\"],
        \"submitted_date\": datetime.utcnow().isoformat(),
        \"approved_by\": \"\",
        \"approved_date\": \"\",
        \"created_at\": datetime.utcnow()
    })
    result = await db.change_orders.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


@app.put(\"/api/costs/change-orders/{co_id}\")
async def update_change_order(co_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    body[\"updated_at\"] = datetime.utcnow().isoformat()
    await db.change_orders.update_one({\"_id\": ObjectId(co_id)}, {\"$set\": body})
    co = await db.change_orders.find_one({\"_id\": ObjectId(co_id)})
    return serialize_doc(co)


@app.get(\"/api/costs/contracts\")
async def get_contracts(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.contracts.find(query).sort(\"created_at\", -1)
    contracts = []
    async for c in cursor:
        contracts.append(serialize_doc(c))
    return contracts


@app.post(\"/api/costs/contracts\")
async def create_contract(body: dict, current_user: dict = Depends(get_current_user)):
    body[\"created_by\"] = current_user[\"id\"]
    body[\"created_at\"] = datetime.utcnow()
    result = await db.contracts.insert_one(body)
    body[\"_id\"] = result.inserted_id
    return serialize_doc(body)


@app.get(\"/api/costs/invoices\")
async def get_invoices(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.invoices.find(query).sort(\"created_at\", -1)
    invoices = []
    async for inv in cursor:
        invoices.append(serialize_doc(inv))
    return invoices


@app.post(\"/api/costs/invoices\")
async def create_invoice(body: dict, current_user: dict = Depends(get_current_user)):
    body[\"created_by\"] = current_user[\"id\"]
    body[\"created_at\"] = datetime.utcnow()
    result = await db.invoices.insert_one(body)
    body[\"_id\"] = result.inserted_id
    return serialize_doc(body)


# ═══════════════════════════════════════════════════════════════════════════
# SAFETY
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/safety/observations\")
async def get_observations(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.safety_observations.find(query).sort(\"created_at\", -1)
    obs = []
    async for o in cursor:
        obs.append(serialize_doc(o))
    return obs


@app.post(\"/api/safety/observations\")
async def create_observation(body: SafetyObservationCreate, current_user: dict = Depends(get_current_user)):
    doc = body.dict()
    obs_num = await get_next_number(\"safety_observations\", body.project_id, \"OBS\")
    doc.update({
        \"obs_number\": obs_num,
        \"status\": \"open\",
        \"observed_by\": current_user[\"id\"],
        \"observed_by_name\": current_user[\"name\"],
        \"photos\": [],
        \"resolved_date\": \"\",
        \"created_at\": datetime.utcnow()
    })
    result = await db.safety_observations.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    if body.severity in [\"high\", \"critical\"]:
        await create_notification_internal(
            body.project_id, \"safety\", f\"Safety Alert: {body.severity.upper()}\",
            f\"A {body.severity} safety observation has been reported: {body.description[:80]}\", \"high\"
        )
    return serialize_doc(doc)


@app.put(\"/api/safety/observations/{obs_id}\")
async def update_observation(obs_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    body[\"updated_at\"] = datetime.utcnow().isoformat()
    await db.safety_observations.update_one({\"_id\": ObjectId(obs_id)}, {\"$set\": body})
    obs = await db.safety_observations.find_one({\"_id\": ObjectId(obs_id)})
    return serialize_doc(obs)


@app.get(\"/api/safety/incidents\")
async def get_incidents(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.incidents.find(query).sort(\"created_at\", -1)
    incidents = []
    async for i in cursor:
        incidents.append(serialize_doc(i))
    return incidents


@app.post(\"/api/safety/incidents\")
async def create_incident(body: IncidentCreate, current_user: dict = Depends(get_current_user)):
    inc_num = await get_next_number(\"incidents\", body.project_id, \"INC\")
    doc = body.dict()
    doc.update({
        \"incident_number\": inc_num,
        \"status\": \"under_investigation\",
        \"reported_by\": current_user[\"id\"],
        \"reported_by_name\": current_user[\"name\"],
        \"supervisor_review\": False,
        \"photos\": [],
        \"created_at\": datetime.utcnow()
    })
    result = await db.incidents.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    await create_notification_internal(
        body.project_id, \"safety\", f\"Incident Reported: {inc_num}\",
        f\"Incident type '{body.type}' reported at {body.location}\", \"critical\"
    )
    return serialize_doc(doc)


@app.put(\"/api/safety/incidents/{inc_id}\")
async def update_incident(inc_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    body[\"updated_at\"] = datetime.utcnow().isoformat()
    await db.incidents.update_one({\"_id\": ObjectId(inc_id)}, {\"$set\": body})
    inc = await db.incidents.find_one({\"_id\": ObjectId(inc_id)})
    return serialize_doc(inc)


@app.get(\"/api/safety/inspections\")
async def get_inspections(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.inspections.find(query).sort(\"created_at\", -1)
    inspections = []
    async for i in cursor:
        inspections.append(serialize_doc(i))
    return inspections


@app.post(\"/api/safety/inspections\")
async def create_inspection(body: InspectionCreate, current_user: dict = Depends(get_current_user)):
    insp_num = await get_next_number(\"inspections\", body.project_id, \"INSP\")
    doc = body.dict()
    total = len(doc.get(\"items\", []))
    passed = sum(1 for i in doc.get(\"items\", []) if i.get(\"status\") == \"pass\")
    score = round((passed / total * 100) if total > 0 else 0, 1)
    doc.update({
        \"inspection_number\": insp_num,
        \"inspector\": current_user[\"name\"],
        \"inspector_id\": current_user[\"id\"],
        \"score\": score,
        \"status\": \"passed\" if score >= 70 else \"failed\",
        \"photos\": [],
        \"created_at\": datetime.utcnow()
    })
    result = await db.inspections.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


# ═══════════════════════════════════════════════════════════════════════════
# RESOURCES
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/resources/crews\")
async def get_crews(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.crews.find(query).sort(\"created_at\", -1)
    crews = []
    async for c in cursor:
        crews.append(serialize_doc(c))
    return crews


@app.post(\"/api/resources/crews\")
async def create_crew(body: CrewCreate, current_user: dict = Depends(get_current_user)):
    doc = body.dict()
    doc.update({\"status\": \"active\", \"created_by\": current_user[\"id\"], \"created_at\": datetime.utcnow()})
    result = await db.crews.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


@app.put(\"/api/resources/crews/{crew_id}\")
async def update_crew(crew_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    await db.crews.update_one({\"_id\": ObjectId(crew_id)}, {\"$set\": body})
    crew = await db.crews.find_one({\"_id\": ObjectId(crew_id)})
    return serialize_doc(crew)


@app.delete(\"/api/resources/crews/{crew_id}\")
async def delete_crew(crew_id: str, current_user: dict = Depends(get_current_user)):
    await db.crews.delete_one({\"_id\": ObjectId(crew_id)})
    return {\"message\": \"Deleted\"}


@app.get(\"/api/resources/equipment\")
async def get_equipment(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.equipment.find(query).sort(\"created_at\", -1)
    equip = []
    async for e in cursor:
        equip.append(serialize_doc(e))
    return equip


@app.post(\"/api/resources/equipment\")
async def create_equipment(body: EquipmentCreate, current_user: dict = Depends(get_current_user)):
    doc = body.dict()
    doc.update({\"created_by\": current_user[\"id\"], \"created_at\": datetime.utcnow()})
    result = await db.equipment.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


@app.put(\"/api/resources/equipment/{equip_id}\")
async def update_equipment(equip_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    await db.equipment.update_one({\"_id\": ObjectId(equip_id)}, {\"$set\": body})
    equip = await db.equipment.find_one({\"_id\": ObjectId(equip_id)})
    return serialize_doc(equip)


@app.delete(\"/api/resources/equipment/{equip_id}\")
async def delete_equipment(equip_id: str, current_user: dict = Depends(get_current_user)):
    await db.equipment.delete_one({\"_id\": ObjectId(equip_id)})
    return {\"message\": \"Deleted\"}


@app.get(\"/api/resources/timesheets\")
async def get_timesheets(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.timesheets.find(query).sort(\"created_at\", -1)
    sheets = []
    async for t in cursor:
        sheets.append(serialize_doc(t))
    return sheets


@app.post(\"/api/resources/timesheets\")
async def create_timesheet(body: TimesheetCreate, current_user: dict = Depends(get_current_user)):
    doc = body.dict()
    doc.update({\"created_by\": current_user[\"id\"], \"created_at\": datetime.utcnow()})
    result = await db.timesheets.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


# ═══════════════════════════════════════════════════════════════════════════
# DOCUMENTS
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/documents\")
async def get_documents(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.documents.find(query).sort(\"created_at\", -1)
    docs = []
    async for d in cursor:
        docs.append(serialize_doc(d))
    return docs


@app.post(\"/api/documents/upload\")
async def upload_document(
    project_id: str = Form(...),
    title: str = Form(...),
    type: str = Form(\"drawing\"),
    number: str = Form(\"\"),
    revision: str = Form(\"0\"),
    discipline: str = Form(\"\"),
    description: str = Form(\"\"),
    tags: str = Form(\"\"),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    ext = Path(file.filename).suffix
    filename = f\"doc_{uuid.uuid4()}{ext}\"
    filepath = UPLOADS_DIR / filename
    with open(filepath, \"wb\") as f:
        content = await file.read()
        f.write(content)
    doc = {
        \"project_id\": project_id, \"title\": title, \"type\": type,
        \"number\": number, \"revision\": revision, \"discipline\": discipline,
        \"description\": description, \"tags\": [t.strip() for t in tags.split(\",\") if t.strip()],
        \"file_name\": file.filename, \"file_url\": f\"/uploads/{filename}\",
        \"file_size\": len(content), \"mime_type\": file.content_type,
        \"status\": \"current\",
        \"uploaded_by\": current_user[\"id\"], \"uploaded_by_name\": current_user[\"name\"],
        \"created_at\": datetime.utcnow()
    }
    result = await db.documents.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


@app.delete(\"/api/documents/{doc_id}\")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    doc = await db.documents.find_one({\"_id\": ObjectId(doc_id)})
    if doc:
        filepath = UPLOADS_DIR / doc.get(\"file_name\", \"\")
        if filepath.exists():
            filepath.unlink()
        await db.documents.delete_one({\"_id\": ObjectId(doc_id)})
    return {\"message\": \"Deleted\"}


# ═══════════════════════════════════════════════════════════════════════════
# PUNCH LISTS
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/punch-list\")
async def get_punch_list(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.punch_list.find(query).sort(\"created_at\", -1)
    items = []
    async for item in cursor:
        items.append(serialize_doc(item))
    return items


@app.post(\"/api/punch-list\")
async def create_punch_item(body: PunchListItemCreate, current_user: dict = Depends(get_current_user)):
    item_num = await get_next_number(\"punch_list\", body.project_id, \"PL\")
    doc = body.dict()
    doc.update({
        \"item_number\": item_num,
        \"status\": \"open\",
        \"created_by\": current_user[\"id\"],
        \"created_by_name\": current_user[\"name\"],
        \"photos\": [],
        \"notes\": [],
        \"closed_date\": \"\",
        \"created_at\": datetime.utcnow()
    })
    result = await db.punch_list.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


@app.put(\"/api/punch-list/{item_id}\")
async def update_punch_item(item_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    if body.get(\"status\") == \"completed\" and not body.get(\"closed_date\"):
        body[\"closed_date\"] = datetime.utcnow().isoformat()
    body[\"updated_at\"] = datetime.utcnow().isoformat()
    await db.punch_list.update_one({\"_id\": ObjectId(item_id)}, {\"$set\": body})
    item = await db.punch_list.find_one({\"_id\": ObjectId(item_id)})
    return serialize_doc(item)


@app.delete(\"/api/punch-list/{item_id}\")
async def delete_punch_item(item_id: str, current_user: dict = Depends(get_current_user)):
    await db.punch_list.delete_one({\"_id\": ObjectId(item_id)})
    return {\"message\": \"Deleted\"}


# ═══════════════════════════════════════════════════════════════════════════
# MEETINGS
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/meetings\")
async def get_meetings(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.meetings.find(query).sort(\"created_at\", -1)
    meetings = []
    async for m in cursor:
        meetings.append(serialize_doc(m))
    return meetings


@app.post(\"/api/meetings\")
async def create_meeting(body: MeetingCreate, current_user: dict = Depends(get_current_user)):
    mtg_num = await get_next_number(\"meetings\", body.project_id, \"MTG\")
    doc = body.dict()
    doc.update({
        \"meeting_number\": mtg_num,
        \"status\": \"scheduled\",
        \"created_by\": current_user[\"id\"],
        \"created_by_name\": current_user[\"name\"],
        \"created_at\": datetime.utcnow()
    })
    result = await db.meetings.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


@app.put(\"/api/meetings/{meeting_id}\")
async def update_meeting(meeting_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    body[\"updated_at\"] = datetime.utcnow().isoformat()
    await db.meetings.update_one({\"_id\": ObjectId(meeting_id)}, {\"$set\": body})
    meeting = await db.meetings.find_one({\"_id\": ObjectId(meeting_id)})
    return serialize_doc(meeting)


@app.delete(\"/api/meetings/{meeting_id}\")
async def delete_meeting(meeting_id: str, current_user: dict = Depends(get_current_user)):
    await db.meetings.delete_one({\"_id\": ObjectId(meeting_id)})
    return {\"message\": \"Deleted\"}


# ═══════════════════════════════════════════════════════════════════════════
# TASKS
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/tasks\")
async def get_tasks(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if project_id:
        query[\"project_id\"] = project_id
    cursor = db.tasks.find(query).sort(\"created_at\", -1)
    tasks = []
    async for t in cursor:
        tasks.append(serialize_doc(t))
    return tasks


@app.post(\"/api/tasks\")
async def create_task(body: TaskCreate, current_user: dict = Depends(get_current_user)):
    doc = body.dict()
    doc.update({
        \"status\": \"todo\",
        \"created_by\": current_user[\"id\"],
        \"created_by_name\": current_user[\"name\"],
        \"created_at\": datetime.utcnow()
    })
    result = await db.tasks.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


@app.put(\"/api/tasks/{task_id}\")
async def update_task(task_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    body[\"updated_at\"] = datetime.utcnow().isoformat()
    await db.tasks.update_one({\"_id\": ObjectId(task_id)}, {\"$set\": body})
    task = await db.tasks.find_one({\"_id\": ObjectId(task_id)})
    return serialize_doc(task)


@app.delete(\"/api/tasks/{task_id}\")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    await db.tasks.delete_one({\"_id\": ObjectId(task_id)})
    return {\"message\": \"Deleted\"}


# ═══════════════════════════════════════════════════════════════════════════
# CHAT
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/chat\")
async def get_messages(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {\"project_id\": project_id} if project_id else {}
    cursor = db.chat_messages.find(query).sort(\"created_at\", -1).limit(100)
    messages = []
    async for m in cursor:
        messages.append(serialize_doc(m))
    return list(reversed(messages))


@app.post(\"/api/chat\")
async def send_message(body: ChatMessageCreate, current_user: dict = Depends(get_current_user)):
    doc = body.dict()
    doc.update({
        \"sender_id\": current_user[\"id\"],
        \"sender_name\": current_user[\"name\"],
        \"is_read\": False,
        \"created_at\": datetime.utcnow()
    })
    result = await db.chat_messages.insert_one(doc)
    doc[\"_id\"] = result.inserted_id
    return serialize_doc(doc)


# ═══════════════════════════════════════════════════════════════════════════
# NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════

async def create_notification_internal(project_id: str, type_: str, title: str, message: str, priority: str = \"medium\"):
    doc = {
        \"project_id\": project_id,
        \"type\": type_,
        \"title\": title,
        \"message\": message,
        \"priority\": priority,
        \"is_read\": False,
        \"created_at\": datetime.utcnow()
    }
    await db.notifications.insert_one(doc)


@app.get(\"/api/notifications\")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    cursor = db.notifications.find({}).sort(\"created_at\", -1).limit(50)
    notifs = []
    async for n in cursor:
        notifs.append(serialize_doc(n))
    return notifs


@app.put(\"/api/notifications/{notif_id}/read\")
async def mark_notification_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    await db.notifications.update_one({\"_id\": ObjectId(notif_id)}, {\"$set\": {\"is_read\": True}})
    return {\"message\": \"Marked as read\"}


@app.put(\"/api/notifications/read-all\")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    await db.notifications.update_many({}, {\"$set\": {\"is_read\": True}})
    return {\"message\": \"All marked as read\"}


# ═══════════════════════════════════════════════════════════════════════════
# DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/dashboard/stats\")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    total_projects = await db.projects.count_documents({})
    active_projects = await db.projects.count_documents({\"status\": \"active\"})
    open_rfis = await db.rfis.count_documents({\"status\": \"open\"})
    pending_submittals = await db.submittals.count_documents({\"status\": {\"$in\": [\"submitted\", \"under_review\"]}})
    open_punch = await db.punch_list.count_documents({\"status\": {\"$in\": [\"open\", \"in_progress\"]}})
    total_incidents = await db.incidents.count_documents({})
    open_observations = await db.safety_observations.count_documents({\"status\": \"open\"})
    unread_notifications = await db.notifications.count_documents({\"is_read\": False})

    # Recent projects
    cursor = db.projects.find({}).sort(\"created_at\", -1).limit(5)
    recent_projects = []
    async for p in cursor:
        recent_projects.append(serialize_doc(p))

    # Recent notifications
    cursor2 = db.notifications.find({}).sort(\"created_at\", -1).limit(5)
    recent_notifs = []
    async for n in cursor2:
        recent_notifs.append(serialize_doc(n))

    # Budget summary
    cursor3 = db.budgets.find({})
    total_budget = 0
    total_actual = 0
    async for b in cursor3:
        total_budget += b.get(\"current_budget\", 0) or 0
        total_actual += b.get(\"actual_cost\", 0) or 0

    # Monthly reports for chart (last 6 months)
    monthly_data = []
    for i in range(5, -1, -1):
        month_start = datetime.utcnow().replace(day=1) - timedelta(days=30 * i)
        month_name = month_start.strftime(\"%b\")
        count = await db.daily_reports.count_documents({
            \"created_at\": {\"$gte\": month_start, \"$lt\": month_start + timedelta(days=30)}
        })
        monthly_data.append({\"month\": month_name, \"reports\": count})

    return {
        \"total_projects\": total_projects,
        \"active_projects\": active_projects,
        \"open_rfis\": open_rfis,
        \"pending_submittals\": pending_submittals,
        \"open_punch_items\": open_punch,
        \"total_incidents\": total_incidents,
        \"open_observations\": open_observations,
        \"unread_notifications\": unread_notifications,
        \"total_budget\": total_budget,
        \"total_actual_cost\": total_actual,
        \"budget_variance\": total_budget - total_actual,
        \"recent_projects\": recent_projects,
        \"recent_notifications\": recent_notifs,
        \"monthly_reports\": monthly_data
    }


# ═══════════════════════════════════════════════════════════════════════════
# AI ASSISTANT
# ═══════════════════════════════════════════════════════════════════════════

@app.post(\"/api/ai/chat\")
async def ai_chat(body: AIRequest, current_user: dict = Depends(get_current_user)):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail=\"AI service not configured\")
    
    system_messages = {
        \"general\": \"You are SitePilot AI, an expert construction management assistant. Help contractors with project management, safety, costs, RFIs, submittals, and best practices. Keep responses concise and practical.\",
        \"daily_report\": \"You are SitePilot AI. Generate structured daily construction report drafts. Return valid JSON when asked for structured data.\",
        \"risk\": \"You are SitePilot AI, a construction risk analyst. Identify and analyze project risks. Return structured JSON risk assessments.\",
        \"rfi\": \"You are SitePilot AI. Help draft RFI responses and technical clarifications for construction projects.\",
        \"summary\": \"You are SitePilot AI. Summarize construction documents, reports, and communications concisely for project managers.\"
    }
    
    session_id = f\"user-{current_user['id']}-{body.type}\"
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_messages.get(body.type, system_messages[\"general\"])
    ).with_model(\"openai\", \"gpt-4o\")
    
    full_prompt = body.prompt
    if body.context:
        full_prompt = f\"Context:\n{body.context}\n\nQuestion/Request:\n{body.prompt}\"
    
    response = await chat.send_message(UserMessage(text=full_prompt))
    return {\"response\": response, \"type\": body.type}


@app.post(\"/api/ai/autofill-report\")
async def ai_autofill_report(body: AIRequest, current_user: dict = Depends(get_current_user)):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail=\"AI service not configured\")
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f\"autofill-{current_user['id']}\",
        system_message=\"You are a construction site AI assistant. Generate structured daily report drafts in JSON format.\"
    ).with_model(\"openai\", \"gpt-4o\")
    
    prompt = f\"\"\"
    Generate a daily report autofill based on this context: {body.context or body.prompt}
    
    Return ONLY valid JSON:
    {{
        \"work_performed\": \"string\",
        \"workers_count\": number,
        \"weather\": \"string\",
        \"work_areas\": [\"string\"],
        \"materials_used\": [{{\"name\": \"string\", \"quantity\": number, \"unit\": \"string\"}}],
        \"issues\": [\"string\"],
        \"safety_observations\": [\"string\"],
        \"next_day_plan\": \"string\"
    }}
    \"\"\"
    response = await chat.send_message(UserMessage(text=prompt))
    
    try:
        start = response.find('{')
        end = response.rfind('}') + 1
        if start >= 0 and end > start:
            data = json.loads(response[start:end])
            return {\"data\": data, \"raw\": response}
    except:
        pass
    return {\"data\": {}, \"raw\": response}


@app.post(\"/api/ai/risk-analysis\")
async def ai_risk_analysis(body: AIRequest, current_user: dict = Depends(get_current_user)):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail=\"AI service not configured\")
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f\"risk-{current_user['id']}\",
        system_message=\"You are a construction risk analyst. Return structured JSON risk assessments.\"
    ).with_model(\"openai\", \"gpt-4o\")
    
    prompt = f\"\"\"
    Analyze project risks for: {body.context or body.prompt}
    
    Return ONLY valid JSON:
    {{
        \"overall_risk_level\": \"LOW|MEDIUM|HIGH|CRITICAL\",
        \"risk_score\": number,
        \"risks\": [
            {{
                \"category\": \"SCHEDULE|COST|SAFETY|QUALITY|RESOURCE\",
                \"severity\": \"LOW|MEDIUM|HIGH|CRITICAL\",
                \"description\": \"string\",
                \"recommended_action\": \"string\"
            }}
        ],
        \"summary\": \"string\",
        \"immediate_actions\": [\"string\"]
    }}
    \"\"\"
    response = await chat.send_message(UserMessage(text=prompt))
    
    try:
        start = response.find('{')
        end = response.rfind('}') + 1
        if start >= 0 and end > start:
            data = json.loads(response[start:end])
            return {\"data\": data, \"raw\": response}
    except:
        pass
    return {\"data\": {}, \"raw\": response}


@app.post(\"/api/ai/summarize\")
async def ai_summarize(body: AIRequest, current_user: dict = Depends(get_current_user)):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail=\"AI service not configured\")
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f\"summary-{current_user['id']}\",
        system_message=\"You are a construction document summarizer. Provide concise executive summaries.\"
    ).with_model(\"openai\", \"gpt-4o\")
    
    prompt = f\"Summarize the following construction document/text for a project manager:\n\n{body.context or body.prompt}\"
    response = await chat.send_message(UserMessage(text=prompt))
    return {\"response\": response}


# ═══════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════════

@app.get(\"/api/\")
async def root():
    return {\"message\": \"SitePilot API is running\", \"version\": \"1.0.0\"}


@app.get(\"/api/health\")
async def health():
    return {\"status\": \"OK\", \"time\": datetime.utcnow().isoformat()}


# ─── Startup: Create demo user ───────────────────────────────────────────────
@app.on_event(\"startup\")
async def startup():
    # Create demo users if none exist
    count = await db.users.count_documents({})
    if count == 0:
        demo_users = [
            {\"name\": \"Alex Johnson\", \"email\": \"alex@sitepilot.com\", \"role\": \"gc\",
             \"company\": \"SitePilot Construction\", \"phone\": \"+1-555-0101\"},
            {\"name\": \"Maria Garcia\", \"email\": \"maria@sitepilot.com\", \"role\": \"owner\",
             \"company\": \"Pacific Development\", \"phone\": \"+1-555-0102\"},
            {\"name\": \"James Lee\", \"email\": \"james@sitepilot.com\", \"role\": \"sub\",
             \"company\": \"Lee Electric Co.\", \"phone\": \"+1-555-0103\"},
            {\"name\": \"Sarah Chen\", \"email\": \"sarah@sitepilot.com\", \"role\": \"specialty\",
             \"company\": \"Chen Mechanical\", \"phone\": \"+1-555-0104\"},
        ]
        for u in demo_users:
            u[\"password_hash\"] = hash_password(\"password123\")
            u[\"avatar\"] = \"\"
            u[\"is_active\"] = True
            u[\"created_at\"] = datetime.utcnow()
            await db.users.insert_one(u)
        print(\"✅ Demo users created\")

    print(\"🚀 SitePilot API started successfully\")
"
Observation: Overwrite successful: /app/backend/server.py