from flask import Blueprint, request, jsonify
from user_models import db
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.DEBUG)
roles_permissions_bp = Blueprint('roles_permissions_bp', __name__, url_prefix='/api/RolesPermissionsManager')

# افزودن نقش
@roles_permissions_bp.route('/roles', methods=['POST'])
def add_role():
    logging.debug("Request received to add role")
    data = request.json
    if not data.get('RoleName'):
        return jsonify({"error": "RoleName is required"}), 400

    try:
        logging.debug(f"Data: {data}")
        db.session.execute(
            text("EXEC spAddRole @RoleName=:RoleName, @Description=:Description"),
            {"RoleName": data['RoleName'], "Description": data.get('Description', None)}
        )
        db.session.commit()
        return jsonify({"message": "Role added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error adding role: {str(e)}")
        return jsonify({"error": str(e)}), 500
# افزودن مجوز
@roles_permissions_bp.route('/permissions', methods=['POST'])
def add_permission():
    data = request.json
    try:
        db.session.execute(
            text("EXEC spAddPermission @PermissionName=:PermissionName, @Description=:Description"),
            {"PermissionName": data['PermissionName'], "Description": data.get('Description', None)}
        )
        db.session.commit()
        return jsonify({"message": "Permission added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# اتصال مجوز به نقش
@roles_permissions_bp.route('/roles/<int:role_id>/permissions', methods=['POST'])
def assign_permission_to_role(role_id):
    data = request.json
    try:
        if not data.get('PermissionID'):
            return jsonify({"error": "PermissionID is required"}), 400

        logging.debug(f"Assigning PermissionID {data['PermissionID']} to RoleID {role_id}")
        
        db.session.execute(
            text("EXEC spAssignPermissionToRole @RoleID=:RoleID, @PermissionID=:PermissionID"),
            {"RoleID": role_id, "PermissionID": data['PermissionID']}
        )
        db.session.commit()
        return jsonify({"message": "Permission assigned to role successfully"}), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error assigning permission to role: {e}")
        return jsonify({"error": str(e)}), 500

# تخصیص نقش به کاربر
@roles_permissions_bp.route('/users/<int:user_id>/roles', methods=['POST'])
def assign_role_to_user(user_id):
    data = request.json
    try:
        if not data.get('RoleID'):
            return jsonify({"error": "RoleID is required"}), 400

        role_id = int(data['RoleID'])  # بررسی اینکه RoleID عددی است
        db.session.execute(
            text("EXEC spAssignRoleToUser @UserID=:UserID, @RoleID=:RoleID"),
            {"UserID": user_id, "RoleID": role_id}
        )
        db.session.commit()
        return jsonify({"message": "Role assigned to user successfully"}), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error assigning role to user: {str(e)}")
        return jsonify({"error": str(e)}), 500


# دریافت نقش‌های کاربر
@roles_permissions_bp.route('/users/<int:user_id>/roles', methods=['GET'])
def get_user_roles(user_id):
    try:
        result = db.session.execute(
            text("EXEC spGetUserRoles @UserID=:UserID"),
            {"UserID": user_id}
        )
        roles = [dict(row) for row in result.fetchall()]
        return jsonify(roles), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# دریافت مجوزهای نقش
@roles_permissions_bp.route('/roles/<int:role_id>/permissions', methods=['GET'])
def get_role_permissions(role_id):
    try:
        result = db.session.execute(
            text("EXEC spGetRolePermissions @RoleID=:RoleID"),
            {"RoleID": role_id}
        )
        permissions = [dict(row) for row in result.fetchall()]
        return jsonify(permissions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# بررسی دسترسی کاربر به مجوز
@roles_permissions_bp.route('/users/<int:user_id>/permissions', methods=['POST'])
def check_user_permission(user_id):
    data = request.json
    try:
        result = db.session.execute(
            text("EXEC spCheckUserPermission @UserID=:UserID, @PermissionName=:PermissionName"),
            {"UserID": user_id, "PermissionName": data['PermissionName']}
        ).fetchone()
        has_permission = result.HasPermission if result else 0
        return jsonify({"has_permission": bool(has_permission)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@roles_permissions_bp.route('/test-db', methods=['GET'])
def test_db():
    try:
        result = db.session.execute(text("SELECT 1 AS Test"))
        rows = result.fetchall()
        output = [dict(row._mapping) for row in rows]  # استفاده از ._mapping برای تبدیل به دیکشنری
        return jsonify({"success": True, "result": output}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
# دریافت لیست نقش‌ها
@roles_permissions_bp.route('/roles', methods=['GET'])
def get_roles():
    try:
        # اجرای استور پروسیجر برای دریافت نقش‌ها
        roles = db.session.execute(text("EXEC spGetAllRoles")).fetchall()
        roles_list = [dict(row._mapping) for row in roles]
        return jsonify(roles_list), 200
    except Exception as e:
        return jsonify({"error": f"خطا در دریافت نقش‌ها: {str(e)}"}), 500

# دریافت لیست مجوزها
@roles_permissions_bp.route('/permissions', methods=['GET'])
def get_permissions():
    try:
        # اجرای استور پروسیجر برای دریافت مجوزها
        permissions = db.session.execute(text("EXEC spGetAllPermissions")).fetchall()
        permissions_list = [dict(row._mapping) for row in permissions]
        return jsonify(permissions_list), 200
    except Exception as e:
        return jsonify({"error": f"خطا در دریافت مجوزها: {str(e)}"}), 500

@roles_permissions_bp.route('/users', methods=['GET'])
def get_users_with_roles_and_permissions():
    try:
        # اجرای استور پروسیجر
        result = db.session.execute(text("EXEC spGetUsersWithRolesAndPermissions"))
        users = []

        for row in result.fetchall():
            user_dict = dict(row._mapping)
            user_id = user_dict["UserID"]

            # بررسی وجود کاربر در لیست
            user = next((u for u in users if u["UserID"] == user_id), None)

            if not user:
                # افزودن کاربر جدید
                user = {
                    "UserID": user_id if user_id else "بدون شناسه",
                    "FirstName": user_dict["FirstName"] or "بدون نام",
                    "LastName": user_dict["LastName"] or "بدون نام خانوادگی",
                    "Roles": [],
                    "Permissions": []
                }
                users.append(user)

            # افزودن نقش
            if user_dict["RoleID"] and user_dict["RoleName"]:
                role = {"RoleID": user_dict["RoleID"], "RoleName": user_dict["RoleName"]}
                if role not in user["Roles"]:
                    user["Roles"].append(role)

            # افزودن مجوز
            if user_dict["PermissionID"] and user_dict["PermissionName"]:
                permission = {
                    "PermissionID": user_dict["PermissionID"],
                    "PermissionName": user_dict["PermissionName"]
                }
                if permission not in user["Permissions"]:
                    user["Permissions"].append(permission)

        return jsonify(users), 200

    except Exception as e:
        return jsonify({"error": f"خطا در دریافت کاربران: {str(e)}"}), 500

@roles_permissions_bp.route('/roles/permissions', methods=['GET'])
def get_roles_with_permissions():
    try:
        result = db.session.execute(text("""
            SELECT 
                r.RoleID,
                r.RoleName,
                p.PermissionID,
                p.PermissionName
            FROM Roles r
            LEFT JOIN RolePermissions rp ON r.RoleID = rp.RoleID
            LEFT JOIN Permissions p ON rp.PermissionID = p.PermissionID
        """))
        # تبدیل نتیجه به ساختاری که شامل نقش‌ها و مجوزهایشان باشد
        roles_with_permissions = {}
        for row in result.fetchall():
            role_id = row.RoleID
            if role_id not in roles_with_permissions:
                roles_with_permissions[role_id] = {
                    "RoleID": role_id,
                    "RoleName": row.RoleName,
                    "Permissions": []
                }
            if row.PermissionID:
                roles_with_permissions[role_id]["Permissions"].append({
                    "PermissionID": row.PermissionID,
                    "PermissionName": row.PermissionName
                })

        return jsonify(list(roles_with_permissions.values())), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500










@roles_permissions_bp.route('/permissions/<int:permission_id>', methods=['DELETE'])
def delete_permission(permission_id):
    try:
        db.session.execute(
            text("EXEC spDeletePermission @PermissionID=:PermissionID"),
            {"PermissionID": permission_id}
        )
        db.session.commit()
        return jsonify({"message": "Permission deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



@roles_permissions_bp.route('/roles/<int:role_id>', methods=['DELETE'])
def delete_role(role_id):
    try:
        db.session.execute(
            text("EXEC spDeleteRole @RoleID=:RoleID"),
            {"RoleID": role_id}
        )
        db.session.commit()
        return jsonify({"message": "Role deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@roles_permissions_bp.route('/permissions/<int:permission_id>', methods=['PUT'])
def update_permission(permission_id):
    data = request.json
    try:
        db.session.execute(
            text("EXEC spUpdatePermission @PermissionID=:PermissionID, @PermissionName=:PermissionName, @Description=:Description"),
            {
                "PermissionID": permission_id,
                "PermissionName": data["PermissionName"],
                "Description": data.get("Description", None),
            }
        )
        db.session.commit()
        return jsonify({"message": "Permission updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@roles_permissions_bp.route('/roles/<int:role_id>', methods=['PUT'])
def update_role(role_id):
    data = request.json
    try:
        db.session.execute(
            text("EXEC spUpdateRole @RoleID=:RoleID, @RoleName=:RoleName, @Description=:Description"),
            {
                "RoleID": role_id,
                "RoleName": data["RoleName"],
                "Description": data.get("Description", None),
            }
        )
        db.session.commit()
        return jsonify({"message": "Role updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



@roles_permissions_bp.route('/roles/<int:role_id>/permissions/<int:permission_id>', methods=['DELETE'])
def remove_permission_from_role(role_id, permission_id):
    try:
        db.session.execute(
            text("EXEC spRemovePermissionFromRole @RoleID=:RoleID, @PermissionID=:PermissionID"),
            {"RoleID": role_id, "PermissionID": permission_id}
        )
        db.session.commit()
        return jsonify({"message": "Permission removed from role successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@roles_permissions_bp.route('/users/<int:user_id>/roles/<int:role_id>', methods=['DELETE'])
def remove_role_from_user(user_id, role_id):
    try:
        db.session.execute(
            text("EXEC spRemoveRoleFromUser @UserID=:UserID, @RoleID=:RoleID"),
            {"UserID": user_id, "RoleID": role_id}
        )
        db.session.commit()
        return jsonify({"message": "Role removed from user successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



