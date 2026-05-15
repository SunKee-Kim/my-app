from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from database import Base


class Organization(Base):
    __tablename__ = "organization"

    org_id = Column(String(20), primary_key=True)
    org_name = Column(String(100), nullable=False)
    parent_org_id = Column(String(20), ForeignKey("organization.org_id"), nullable=True)
    sort_order = Column(Integer, default=0)
    use_yn = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    children = relationship(
        "Organization",
        foreign_keys="[Organization.parent_org_id]",
        backref=backref("parent", remote_side="Organization.org_id"),
    )
    users = relationship("User", back_populates="organization")


class User(Base):
    __tablename__ = "user"

    user_id = Column(String(50), primary_key=True)
    user_name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    org_id = Column(String(20), ForeignKey("organization.org_id"), nullable=True)
    use_yn = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    organization = relationship("Organization", back_populates="users")
    menu_permissions = relationship("UserMenuPermission", back_populates="user")
    button_permissions = relationship("UserButtonPermission", back_populates="user")


class CommonCodeGroup(Base):
    __tablename__ = "common_code_group"

    group_code = Column(String(50), primary_key=True)
    group_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    use_yn = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    codes = relationship("CommonCode", back_populates="group")


class CommonCode(Base):
    __tablename__ = "common_code"

    group_code = Column(String(50), ForeignKey("common_code_group.group_code"), primary_key=True)
    code = Column(String(50), primary_key=True)
    code_name = Column(String(100), nullable=False)
    sort_order = Column(Integer, default=0)
    use_yn = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    group = relationship("CommonCodeGroup", back_populates="codes")


class Menu(Base):
    __tablename__ = "menu"

    menu_id = Column(String(50), primary_key=True)
    menu_name = Column(String(100), nullable=False)
    parent_menu_id = Column(String(50), ForeignKey("menu.menu_id"), nullable=True)
    url = Column(String(255), nullable=True)
    icon = Column(String(100), nullable=True)
    sort_order = Column(Integer, default=0)
    use_yn = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    children = relationship(
        "Menu",
        foreign_keys="[Menu.parent_menu_id]",
        backref=backref("parent", remote_side="Menu.menu_id"),
    )
    buttons = relationship("ScreenButton", back_populates="menu")
    user_permissions = relationship("UserMenuPermission", back_populates="menu")


class ScreenButton(Base):
    __tablename__ = "screen_button"

    button_id = Column(String(50), primary_key=True)
    menu_id = Column(String(50), ForeignKey("menu.menu_id"), nullable=False)
    button_name = Column(String(100), nullable=False)
    button_code = Column(String(50), nullable=False)
    sort_order = Column(Integer, default=0)
    use_yn = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    menu = relationship("Menu", back_populates="buttons")
    user_permissions = relationship("UserButtonPermission", back_populates="button")


class UserMenuPermission(Base):
    __tablename__ = "user_menu_permission"

    user_id = Column(String(50), ForeignKey("user.user_id"), primary_key=True)
    menu_id = Column(String(50), ForeignKey("menu.menu_id"), primary_key=True)
    can_read = Column(Boolean, default=False)
    can_write = Column(Boolean, default=False)
    can_update = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)

    user = relationship("User", back_populates="menu_permissions")
    menu = relationship("Menu", back_populates="user_permissions")


class UserButtonPermission(Base):
    __tablename__ = "user_button_permission"

    user_id = Column(String(50), ForeignKey("user.user_id"), primary_key=True)
    button_id = Column(String(50), ForeignKey("screen_button.button_id"), primary_key=True)
    granted = Column(Boolean, default=False)

    user = relationship("User", back_populates="button_permissions")
    button = relationship("ScreenButton", back_populates="user_permissions")
