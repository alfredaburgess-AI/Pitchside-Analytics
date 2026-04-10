#!/bin/bash
# Setup script for Pitchside Analytics Dashboard
# Run from the project root: bash dashboard/setup_assets.sh

DASH="$(cd "$(dirname "$0")" && pwd)"
SRC="$(dirname "$DASH")"

echo "📦 Setting up Pitchside Analytics assets..."
echo "   Dashboard: $DASH"
echo "   Source:    $SRC"

# Create directories
mkdir -p "$DASH/public/logos/opponents"
mkdir -p "$DASH/public/headshots"
mkdir -p "$DASH/src/data"

# Copy primary logos
cp "$SRC/public/logos/PortlandHearts_logo.png" "$DASH/public/PortlandHearts_logo.png" 2>/dev/null && echo "✅ Portland Hearts logo" || echo "⚠️  Portland Hearts logo not found"
cp "$SRC/public/logos/USL_League_One_horz_logo.png" "$DASH/public/USL_League_One_horz_logo.png" 2>/dev/null && echo "✅ USL League One logo" || echo "⚠️  USL League One logo not found"

# Copy opponent logos
count=0
for f in "$SRC/public/logos/opponents/"*; do
  if [ -f "$f" ]; then
    cp "$f" "$DASH/public/logos/opponents/" 2>/dev/null
    count=$((count + 1))
  fi
done
echo "✅ Copied $count opponent logos"

# Copy headshots
count=0
for f in "$SRC/usl1_scraper/Player Headshots/"*; do
  if [ -f "$f" ]; then
    cp "$f" "$DASH/public/headshots/" 2>/dev/null
    count=$((count + 1))
  fi
done
echo "✅ Copied $count player headshots"

# Copy tactical data
cp "$SRC/usl1_scraper/final_tactical_data.json" "$DASH/src/data/final_tactical_data.json" 2>/dev/null && echo "✅ Tactical data" || echo "⚠️  Tactical data not found"

# Create placeholder logo (simple SVG → PNG substitute)
if [ ! -f "$DASH/public/logos/opponents/usl1_placeholder.png" ]; then
  # Create a minimal placeholder SVG that can be referenced
  cat > "$DASH/public/logos/opponents/usl1_placeholder.svg" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
  <text x="32" y="38" text-anchor="middle" fill="#666" font-family="Arial" font-size="10" font-weight="bold">USL1</text>
</svg>
EOF
  echo "✅ Created USL1 placeholder"
fi

echo ""
echo "🎉 Asset setup complete! Run: cd dashboard && npm run dev"
