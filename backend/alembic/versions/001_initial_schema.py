"""initial schema and seed

Revision ID: 001
Revises:
Create Date: 2026-06-02
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

P1 = "11111111-1111-1111-1111-111111111101"
P2 = "11111111-1111-1111-1111-111111111102"
P3 = "11111111-1111-1111-1111-111111111103"
O_IDS = [
    "22222222-2222-2222-2222-222222222201",
    "22222222-2222-2222-2222-222222222202",
    "22222222-2222-2222-2222-222222222203",
    "22222222-2222-2222-2222-222222222204",
    "22222222-2222-2222-2222-222222222205",
    "22222222-2222-2222-2222-222222222206",
    "22222222-2222-2222-2222-222222222207",
    "22222222-2222-2222-2222-222222222208",
    "22222222-2222-2222-2222-222222222209",
]


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(100), unique=True, nullable=False),
        sa.Column("sku", sa.String(50), unique=True, nullable=False),
        sa.Column("name_fr", sa.String(255), nullable=False),
        sa.Column("name_ar", sa.String(255), nullable=False),
        sa.Column("description_short", sa.Text(), nullable=False),
        sa.Column("description_long", sa.Text(), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("base_price_mad", sa.Numeric(10, 2), nullable=False),
        sa.Column("compare_at_price_mad", sa.Numeric(10, 2), nullable=False),
        sa.Column("material", sa.Text()),
        sa.Column("rating", sa.Numeric(2, 1), server_default="0"),
        sa.Column("review_count", sa.Integer(), server_default="0"),
        sa.Column("badge", sa.String(50)),
        sa.Column("images", postgresql.JSONB(), server_default="[]"),
        sa.Column("benefits", postgresql.JSONB(), server_default="[]"),
        sa.Column("cross_sell_slug", sa.String(100)),
        sa.Column("upsell_slug", sa.String(100)),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("idx_products_slug", "products", ["slug"])
    op.create_index("idx_products_category", "products", ["category"])

    op.create_table(
        "offers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("slug", sa.String(100), unique=True, nullable=False),
        sa.Column("label_ar", sa.String(255), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("price_mad", sa.Numeric(10, 2), nullable=False),
        sa.Column("compare_at_price_mad", sa.Numeric(10, 2)),
        sa.Column("savings_mad", sa.Numeric(10, 2)),
        sa.Column("is_default", sa.Boolean(), server_default="false"),
        sa.Column("badge_ar", sa.String(100)),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("idx_offers_product_id", "offers", ["product_id"])

    op.create_table(
        "orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("order_number", sa.String(20), unique=True, nullable=False),
        sa.Column("customer_name", sa.String(255), nullable=False),
        sa.Column("customer_phone", sa.String(20), nullable=False),
        sa.Column("phone_display", sa.String(20), nullable=False),
        sa.Column("subtotal_mad", sa.Numeric(10, 2), nullable=False),
        sa.Column("upsell_amount_mad", sa.Numeric(10, 2), server_default="0"),
        sa.Column("total_mad", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", sa.String(30), server_default="pending"),
        sa.Column("upsell_accepted", sa.Boolean(), server_default="false"),
        sa.Column("upsell_product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id")),
        sa.Column("payment_method", sa.String(20), server_default="COD"),
        sa.Column("event_id", sa.String(100)),
        sa.Column("fbp", sa.String(255)),
        sa.Column("fbc", sa.String(255)),
        sa.Column("ttclid", sa.String(255)),
        sa.Column("sc_click_id", sa.String(255)),
        sa.Column("client_ip", sa.String(45)),
        sa.Column("user_agent", sa.Text()),
        sa.Column("source_url", sa.Text()),
        sa.Column("sheet_synced", sa.Boolean(), server_default="false"),
        sa.Column("sheet_synced_at", sa.DateTime(timezone=True)),
        sa.Column("capi_synced", sa.Boolean(), server_default="false"),
        sa.Column("capi_synced_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.Column("confirmed_at", sa.DateTime(timezone=True)),
    )
    op.create_index("idx_orders_order_number", "orders", ["order_number"])
    op.create_index("idx_orders_phone", "orders", ["customer_phone"])
    op.create_index("idx_orders_status", "orders", ["status"])
    op.create_index("idx_orders_created_at", "orders", ["created_at"])

    op.create_table(
        "order_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id")),
        sa.Column("offer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("offers.id")),
        sa.Column("product_name_ar", sa.String(255), nullable=False),
        sa.Column("offer_label_ar", sa.String(255)),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price_mad", sa.Numeric(10, 2), nullable=False),
        sa.Column("total_price_mad", sa.Numeric(10, 2), nullable=False),
        sa.Column("is_upsell", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("idx_order_items_order_id", "order_items", ["order_id"])

    imgs_ring1 = [
        {"url": "https://images.unsplash.com/photo-1605100804763-247f67b35585?w=800&q=80", "alt": "خاتم الرابط الأبدي", "sort_order": 0},
        {"url": "https://images.unsplash.com/photo-1603561596112-067a23a47fc8?w=800&q=80", "alt": "تفاصيل الخاتم", "sort_order": 1},
        {"url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80", "alt": "الخاتم مُرتدى", "sort_order": 2},
        {"url": "https://images.unsplash.com/photo-1543294001-fd4a5d7a84a7?w=800&q=80", "alt": "التغليف", "sort_order": 3},
    ]
    imgs_neck = [
        {"url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80", "alt": "قلادة البرسيم", "sort_order": 0},
        {"url": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80", "alt": "تفاصيل القلادة", "sort_order": 1},
        {"url": "https://images.unsplash.com/photo-1515562141202-7a88fb084127?w=800&q=80", "alt": "القلادة مُرتداة", "sort_order": 2},
        {"url": "https://images.unsplash.com/photo-1543294001-fd4a5d7a84a7?w=800&q=80", "alt": "التغليف", "sort_order": 3},
    ]
    imgs_ring2 = [
        {"url": "https://images.unsplash.com/photo-1603561596112-067a23a47fc8?w=800&q=80", "alt": "خاتم التوقيع المزدوج", "sort_order": 0},
        {"url": "https://images.unsplash.com/photo-1605100804763-247f67b35585?w=800&q=80", "alt": "تفاصيل", "sort_order": 1},
        {"url": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80", "alt": "مُرتدى", "sort_order": 2},
        {"url": "https://images.unsplash.com/photo-1543294001-fd4a5d7a84a7?w=800&q=80", "alt": "التغليف", "sort_order": 3},
    ]

    op.bulk_insert(
        sa.table(
            "products",
            sa.column("id", postgresql.UUID()),
            sa.column("slug", sa.String),
            sa.column("sku", sa.String),
            sa.column("name_fr", sa.String),
            sa.column("name_ar", sa.String),
            sa.column("description_short", sa.Text),
            sa.column("description_long", sa.Text),
            sa.column("category", sa.String),
            sa.column("base_price_mad", sa.Numeric),
            sa.column("compare_at_price_mad", sa.Numeric),
            sa.column("material", sa.Text),
            sa.column("rating", sa.Numeric),
            sa.column("review_count", sa.Integer),
            sa.column("badge", sa.String),
            sa.column("images", postgresql.JSONB),
            sa.column("benefits", postgresql.JSONB),
            sa.column("cross_sell_slug", sa.String),
            sa.column("upsell_slug", sa.String),
            sa.column("sort_order", sa.Integer),
        ),
        [
            {
                "id": P1,
                "slug": "bague-lien-eternel",
                "sku": "GR-BLE-001",
                "name_fr": "Bague Lien Éternel By GUMÜÇ Royal",
                "name_ar": "خاتم الرابط الأبدي — By GUMÜÇROYAL",
                "description_short": "Le maillon iconique réinventé en anneau ouvert, pavé de zircons taille brillant avec une pierre solitaire en son centre.",
                "description_long": "Le maillon iconique réinventé en anneau ouvert, pavé de zircons taille brillant avec une pierre solitaire en son centre. Acier inoxydable doré à l'or fin — un éclat qui ne ternit jamais.",
                "category": "bagues",
                "base_price_mad": 249,
                "compare_at_price_mad": 399,
                "material": "Acier inoxydable 316L, dorure or fin 18K, zircons CZ",
                "rating": 0,
                "review_count": 0,
                "badge": "Best Seller",
                "images": imgs_ring1,
                "benefits": ["✨ éclat diamant sans prix diamant", "💎 pierre solitaire + zircons pavés", "🔒 acier 316L — ma kaybehdelch", "📐 taille ajustable", "🎁 boîte cadeau premium"],
                "cross_sell_slug": "collier-trefle-lumiere",
                "upsell_slug": "collier-trefle-lumiere",
                "sort_order": 1,
            },
            {
                "id": P2,
                "slug": "collier-trefle-lumiere",
                "sku": "GR-CTL-002",
                "name_fr": "Collier Trèfle de Lumière By GUMÜÇ Royal",
                "name_ar": "قلادة البرسيم المضيء — By GUMÜÇROYAL",
                "description_short": "Une double chaîne délicate ponctuée de quatre trèfles porte-bonheur pavés de zircons étincelants.",
                "description_long": "Une double chaîne délicate ponctuée de quatre trèfles porte-bonheur pavés de zircons étincelants. L'élégance discrète qui se remarque, en acier inoxydable doré à l'or fin.",
                "category": "colliers",
                "base_price_mad": 279,
                "compare_at_price_mad": 449,
                "material": "Acier inoxydable 316L, dorure or fin 18K, zircons CZ",
                "rating": 0,
                "review_count": 0,
                "badge": "Porte-Bonheur",
                "images": imgs_neck,
                "benefits": ["🍀 4 trèfles porte-bonheur", "✨ double chaîne délicate", "💫 zircons taille brillant", "🔒 acier inoxydable", "🎁 emballage cadeau premium"],
                "cross_sell_slug": "bague-double-signature",
                "upsell_slug": "bague-lien-eternel",
                "sort_order": 2,
            },
            {
                "id": P3,
                "slug": "bague-double-signature",
                "sku": "GR-BDS-003",
                "name_fr": "Bague Double Signature By GUMÜÇ Royal",
                "name_ar": "خاتم التوقيع المزدوج — By GUMÜÇROYAL",
                "description_short": "Un design architectural à deux extrémités pavées de zircons, ferme et résolument féminin.",
                "description_long": "Un design architectural à deux extrémités pavées de zircons, ferme et résolument féminin. Forme ouverte ajustable, en acier inoxydable doré à l'or fin.",
                "category": "bagues",
                "base_price_mad": 229,
                "compare_at_price_mad": 369,
                "material": "Acier inoxydable 316L, dorure or fin 18K, zircons CZ",
                "rating": 0,
                "review_count": 0,
                "badge": "Nouveau",
                "images": imgs_ring2,
                "benefits": ["💎 design architectural unique", "✨ zircons pavés", "📐 forme ajustable", "🔒 acier 316L", "🎁 boîte cadeau premium"],
                "cross_sell_slug": "collier-trefle-lumiere",
                "upsell_slug": "collier-trefle-lumiere",
                "sort_order": 3,
            },
        ],
    )

    offers = [
        (P1, "GR-BLE-001-single", "قطعة واحدة", 1, 249, 399, None, False, None, 1),
        (P1, "GR-BLE-001-duo", "عرض زوجي", 2, 429, 798, 69, True, "⭐ الأكثر طلباً", 2),
        (P1, "GR-BLE-001-trio", "عرض العائلة", 3, 549, 1197, 198, False, "أفضل قيمة", 3),
        (P2, "GR-CTL-002-single", "قطعة واحدة", 1, 279, 449, None, False, None, 1),
        (P2, "GR-CTL-002-duo", "عرض زوجي", 2, 479, 898, 79, True, "⭐ الأكثر طلباً", 2),
        (P2, "GR-CTL-002-trio", "عرض العائلة", 3, 599, 1347, 238, False, "أفضل قيمة", 3),
        (P3, "GR-BDS-003-single", "قطعة واحدة", 1, 229, 369, None, False, None, 1),
        (P3, "GR-BDS-003-duo", "عرض زوجي", 2, 389, 738, 69, True, "⭐ الأكثر طلباً", 2),
        (P3, "GR-BDS-003-trio", "عرض العائلة", 3, 499, 1107, 188, False, "أفضل قيمة", 3),
    ]
    offer_rows = []
    for i, (product_id, slug, label, qty, price, compare, savings, is_default, badge, sort) in enumerate(offers):
        offer_rows.append({
            "id": O_IDS[i],
            "product_id": product_id,
            "slug": slug,
            "label_ar": label,
            "quantity": qty,
            "price_mad": price,
            "compare_at_price_mad": compare,
            "savings_mad": savings,
            "is_default": is_default,
            "badge_ar": badge,
            "sort_order": sort,
        })

    op.bulk_insert(
        sa.table(
            "offers",
            sa.column("id", postgresql.UUID()),
            sa.column("product_id", postgresql.UUID()),
            sa.column("slug", sa.String),
            sa.column("label_ar", sa.String),
            sa.column("quantity", sa.Integer),
            sa.column("price_mad", sa.Numeric),
            sa.column("compare_at_price_mad", sa.Numeric),
            sa.column("savings_mad", sa.Numeric),
            sa.column("is_default", sa.Boolean),
            sa.column("badge_ar", sa.String),
            sa.column("sort_order", sa.Integer),
        ),
        offer_rows,
    )


def downgrade() -> None:
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("offers")
    op.drop_table("products")
