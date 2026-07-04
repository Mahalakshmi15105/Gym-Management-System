from datetime import datetime
from app.extensions import db


class Gym(db.Model):
    __tablename__ = 'gyms'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to users
    users = db.relationship('User', backref='gym', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Roles: 'super_admin', 'gym_owner', 'member'
    role = db.Column(db.String(20), nullable=False, default='gym_owner')
    
    # Multi-tenant isolation: Every user (Gym Owner, Member) belongs to a specific Gym.
    # Nullable ONLY for super_admins (who manage the entire SaaS platform) or during registration setup.
    gym_id = db.Column(db.Integer, db.ForeignKey('gyms.id', ondelete='CASCADE'), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'gym_id': self.gym_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
