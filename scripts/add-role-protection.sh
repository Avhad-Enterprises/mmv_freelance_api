#!/bin/bash

# Script to add requireRole middleware to all remaining route files
echo "🚀 Adding requireRole middleware to all feature routes..."

# Array of route files to update
declare -a route_files=(
    "src/features/review/review.routes.ts"
    "src/features/favorites/favorites.routes.ts"
    "src/features/saved_project/saved_project.routes.ts"
    "src/features/upload/upload.routes.ts"
    "src/features/email/email.routes.ts"
    "src/features/tag/tag.routes.ts"
    "src/features/cms/cms.routes.ts"
    "src/features/seo/seo.routes.ts"
    "src/features/location/location.routes.ts"
    "src/features/support-ticket/support-ticket.routes.ts"
    "src/features/report/report.routes.ts"
    "src/features/category/category.routes.ts"
    "src/features/skill/skill.routes.ts"
    "src/features/client_profiles/client_profiles.routes.ts"
    "src/features/videoeditors/videoeditor.routes.ts"
    "src/features/freelancer_profiles/freelancer_profiles.routes.ts"
)

# Function to check if file needs requireRole import
add_require_role_import() {
    local file="$1"
    if [ -f "$file" ]; then
        # Check if requireRole import already exists
        if ! grep -q "requireRole" "$file"; then
            echo "✅ Adding requireRole import to $file"
            # Add import after other imports
            sed -i '' '/import.*from.*interface/a\
import { requireRole } from '"'"'../../middlewares/role.middleware'"'"';
' "$file"
        else
            echo "ℹ️  requireRole import already exists in $file"
        fi
    else
        echo "❌ File not found: $file"
    fi
}

# Function to create a backup
create_backup() {
    local file="$1"
    if [ -f "$file" ]; then
        cp "$file" "$file.backup.$(date +%Y%m%d_%H%M%S)"
        echo "📁 Backup created for $file"
    fi
}

echo "📁 Creating backups of all route files..."
for file in "${route_files[@]}"; do
    create_backup "$file"
done

echo ""
echo "🔧 Adding requireRole imports..."
for file in "${route_files[@]}"; do
    add_require_role_import "$file"
done

echo ""
echo "✅ Basic imports added! Now you need to manually add requireRole to individual endpoints."
echo ""
echo "📋 Pattern to follow:"
echo "   this.router.get('/endpoint',"
echo "     requireRole('ROLE1', 'ROLE2'),"
echo "     controller.method"
echo "   );"
echo ""
echo "🎯 Common role patterns:"
echo "   - Admin only: requireRole('ADMIN', 'SUPER_ADMIN')"
echo "   - Client only: requireRole('CLIENT')" 
echo "   - Editors only: requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR')"
echo "   - All users: requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN')"
echo ""
echo "🎉 Script completed!"