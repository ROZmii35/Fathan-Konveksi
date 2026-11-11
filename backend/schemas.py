from datetime import date
from typing import Optional
from pydantic import BaseModel, Field

class RegisterIn(BaseModel):
    name: str; org: str = ""; wa: str; email: str; password: str

class StaffIn(BaseModel):
    name: str; email: str; wa: str; password: str = Field(min_length=8)

class ColorQty(BaseModel):
    color: str; qty: int = Field(ge=0)

class OrderIn(BaseModel):
    customer_id: int; product: str; material: str; size: str = ""
    colors: list[ColorQty]; price: int = Field(gt=0); due: date; note: str = ""
    dp_percent: int = Field(default=0, ge=0, le=100)

class StageIn(BaseModel):
    stage: str

class PayIn(BaseModel):
    amount: int = Field(gt=0); kind: str = "Cicilan"

class RequestIn(BaseModel):
    product: str; material: str; colors: list[str]; qty: int = Field(gt=0)
    size: str = ""; needed: Optional[date] = None; note: str = ""

class MoveIn(BaseModel):
    stock_id: int; qty: float = Field(gt=0); direction: str

class CashIn(BaseModel):
    desc: str; cat: str; amount: int = Field(gt=0); direction: str
