from flask import Blueprint, request, jsonify
from sqlalchemy.sql import text
from user_models import db

page_bp = Blueprint('page_bp', __name__)


# دریافت لیست صفحات همراه با نقش‌ها و مجوزها
@page_bp.route('/pages', methods=['GET'])
def get_pages():
    try:
        pages = db.session.execute(
            text("EXEC spGetPagesWithRolesAndPermissions")
        ).fetchall()
        pages_list = [dict(row._mapping) for row in pages]
        return jsonify(pages_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# افزودن صفحه جدید
@page_bp.route('/pages', methods=['POST'])
def add_page():
    data = request.json
    print(f"Received data: {data}")  # برای دیباگ لاگ کنید
    try:
        db.session.execute(
            text("EXEC spAddPage @PageName=:PageName, @PageURL=:PageURL"),
            {"PageName": data['PageName'], "PageURL": data['PageURL']}
        )
        db.session.commit()
        return jsonify({"message": "صفحه با موفقیت اضافه شد"}), 201
    except Exception as e:
        print(f"Error adding page: {str(e)}")  # لاگ خطا برای دیباگ
        return jsonify({"error": str(e)}), 500

# ویرایش صفحه
@page_bp.route('/pages/<int:page_id>', methods=['PUT'])
def edit_page(page_id):
    data = request.json
    try:
        db.session.execute(
            text("EXEC spEditPage @PageID=:PageID, @PageName=:PageName, @PageURL=:PageURL"),
            {"PageID": page_id, "PageName": data['PageName'], "PageURL": data['PageURL']}
        )
        db.session.commit()
        return jsonify({"message": "صفحه با موفقیت ویرایش شد"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# حذف صفحه
@page_bp.route('/pages/<int:page_id>', methods=['DELETE'])
def delete_page(page_id):
    try:
        db.session.execute(
            text("EXEC spDeletePage @PageID=:PageID"),
            {"PageID": page_id}
        )
        db.session.commit()
        return jsonify({"message": "صفحه با موفقیت حذف شد"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ارتباط دادن نقش به صفحه
@page_bp.route('/pages/<int:page_id>/roles', methods=['POST'])
def assign_role_to_page(page_id):
    data = request.json
    try:
        db.session.execute(
            text("EXEC spAssignRoleToPage @PageID=:PageID, @RoleID=:RoleID"),
            {"PageID": page_id, "RoleID": data['RoleID']}
        )
        db.session.commit()
        return jsonify({"message": "نقش با موفقیت به صفحه اضافه شد"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    
# حذف نقش از صفحه
@page_bp.route('/pages/<int:page_id>/roles/<int:role_id>', methods=['DELETE'])
def remove_role_from_page(page_id, role_id):
    try:
        db.session.execute(
            text("EXEC spRemoveRoleFromPage @PageID=:PageID, @RoleID=:RoleID"),
            {"PageID": page_id, "RoleID": role_id}
        )
        db.session.commit()
        return jsonify({"message": "نقش با موفقیت از صفحه حذف شد"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ارتباط دادن مجوز به صفحه
@page_bp.route('/pages/<int:page_id>/permissions', methods=['POST'])
def assign_permission_to_page(page_id):
    data = request.json
    try:
        db.session.execute(
            text("EXEC spAssignPermissionToPage @PageID=:PageID, @PermissionID=:PermissionID"),
            {"PageID": page_id, "PermissionID": data['PermissionID']}
        )
        db.session.commit()
        return jsonify({"message": "مجوز با موفقیت به صفحه اضافه شد"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# حذف مجوز از صفحه
@page_bp.route('/pages/<int:page_id>/permissions/<int:permission_id>', methods=['DELETE'])
def remove_permission_from_page(page_id, permission_id):
    try:
        db.session.execute(
            text("EXEC spRemovePermissionFromPage @PageID=:PageID, @PermissionID=:PermissionID"),
            {"PageID": page_id, "PermissionID": permission_id}
        )
        db.session.commit()
        return jsonify({"message": "مجوز با موفقیت از صفحه حذف شد"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# گرفتن صفحات قابل دسترسی برای کاربر
@page_bp.route('/pages/user/<int:user_id>', methods=['GET'])
def get_pages_for_user(user_id):
    try:
        pages = db.session.execute(
            text("EXEC spGetAccessiblePagesForUser @UserID=:UserID"),
            {"UserID": user_id}
        ).fetchall()
        pages_list = [dict(row._mapping) for row in pages]
        return jsonify(pages_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#گرفتن کاربران مجاز برای یک صفحه
@page_bp.route('/pages/<int:page_id>/users', methods=['GET'])
def get_users_for_page(page_id):
    try:
        users = db.session.execute(
            text("EXEC spGetUsersForPage @PageID=:PageID"),
            {"PageID": page_id}
        ).fetchall()
        users_list = [dict(row._mapping) for row in users]
        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# دریافت لیست نقش‌ها از استور پروسیجر
# دریافت لیست نقش‌ها از استور پروسیجر
# roles
@page_bp.route('/roles', methods=['GET'])
def get_roles():
    try:
       
        roles = db.session.execute(text("EXEC spGetAllRoles")).fetchall()
        roles_list = [dict(row._mapping) for row in roles]
       
        return jsonify(roles_list), 200
    except Exception as e:
       
        return jsonify({"error": str(e)}), 500

@page_bp.route('/permissions', methods=['GET'])
def get_permissions():
    try:
       
        permissions = db.session.execute(text("EXEC spGetAllPermissions")).fetchall()
        permissions_list = [dict(row._mapping) for row in permissions]
       
        return jsonify(permissions_list), 200
    except Exception as e:
     
        return jsonify({"error": str(e)}), 500
