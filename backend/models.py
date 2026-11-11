from sqlalchemy import JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    org: Mapped[str] = mapped_column(default="")
    email: Mapped[str] = mapped_column(unique=True, index=True)
    wa: Mapped[str] = mapped_column(unique=True)
    role: Mapped[str]  # owner | admin | customer
    active: Mapped[bool] = mapped_column(default=True)
    pw: Mapped[str]

    def public(self):
        return dict(id=self.id, name=self.name, org=self.org or "", email=self.email, wa=self.wa, role=self.role, active=self.active)

class Payment(Base):
    __tablename__ = "payments"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    date: Mapped[str]
    kind: Mapped[str]
    amount: Mapped[int]
    order: Mapped["Order"] = relationship(back_populates="payments")

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    no: Mapped[str] = mapped_column(unique=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    product: Mapped[str]
    material: Mapped[str]
    size: Mapped[str] = mapped_column(default="")
    colors: Mapped[list] = mapped_column(JSON)  # [{"color": "Sage", "qty": 80}]
    price: Mapped[int]
    due: Mapped[str]
    stage: Mapped[str] = mapped_column(default="Pesanan masuk")
    note: Mapped[str] = mapped_column(default="")
    customer: Mapped[User] = relationship()
    payments: Mapped[list[Payment]] = relationship(back_populates="order", cascade="all, delete-orphan", order_by="Payment.id")

    def view(self):
        total = self.price * sum(c["qty"] for c in self.colors)
        paid = sum(p.amount for p in self.payments)
        return dict(id=self.id, no=self.no, customer_id=self.customer_id, customer=self.customer.org or self.customer.name,
                    product=self.product, material=self.material, size=self.size, colors=self.colors, price=self.price,
                    due=self.due, stage=self.stage, note=self.note, total=total, paid=paid, remaining=total - paid,
                    payments=[dict(date=p.date, kind=p.kind, amount=p.amount) for p in self.payments])

class OrderRequest(Base):
    __tablename__ = "requests"
    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    product: Mapped[str]
    material: Mapped[str]
    colors: Mapped[list] = mapped_column(JSON)
    qty: Mapped[int]
    size: Mapped[str] = mapped_column(default="")
    needed: Mapped[str | None] = mapped_column(default=None)
    note: Mapped[str] = mapped_column(default="")
    status: Mapped[str] = mapped_column(default="Menunggu penawaran")

    def view(self):
        return {c: getattr(self, c) for c in ("id", "customer_id", "product", "material", "colors", "qty", "size", "needed", "note", "status")}

class Stock(Base):
    __tablename__ = "stock"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    color: Mapped[str]
    qty: Mapped[float]
    min: Mapped[float]
    unit: Mapped[str]

    def view(self):
        return dict(id=self.id, name=self.name, color=self.color, qty=self.qty, min=self.min, unit=self.unit, low=self.qty < self.min)

class Cash(Base):
    __tablename__ = "cash"
    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[str]
    desc: Mapped[str]
    cat: Mapped[str]
    order_no: Mapped[str | None] = mapped_column(default=None)
    masuk: Mapped[int] = mapped_column(default=0)
    keluar: Mapped[int] = mapped_column(default=0)

    def view(self):
        return dict(id=self.id, date=self.date, desc=self.desc, cat=self.cat, order_no=self.order_no, masuk=self.masuk, keluar=self.keluar)
