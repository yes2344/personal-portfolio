from rest_framework.permissions import SAFE_METHODS, BasePermission


class PublicReadOnlyOrStaff(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or bool(request.user and request.user.is_staff)


class PublicCreateOrStaff(BasePermission):
    def has_permission(self, request, view):
        return request.method == "POST" or bool(request.user and request.user.is_staff)

    def has_object_permission(self, request, view, obj):
        return bool(request.user and request.user.is_staff)
