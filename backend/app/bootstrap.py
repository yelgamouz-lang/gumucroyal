import logging
import uuid

from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models.offer import Offer
from app.models.product import Product

logger = logging.getLogger(__name__)

P1 = uuid.UUID("11111111-1111-1111-1111-111111111101")
P2 = uuid.UUID("11111111-1111-1111-1111-111111111102")
P3 = uuid.UUID("11111111-1111-1111-1111-111111111103")

RING1 = "https://images.unsplash.com/photo-1605100804763-247f67b35585?w=800&q=80"
RING2 = "https://images.unsplash.com/photo-1603561596112-067a23a47fc8?w=800&q=80"
NECK = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80"
LIFE = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"
PACK = "https://images.unsplash.com/photo-1543294001-fd4a5d7a84a7?w=800&q=80"


def init_sqlite_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Product).first():
            logger.info("SQLite DB already seeded")
            return
        _seed(db)
        db.commit()
        logger.info("SQLite DB created and seeded")
    finally:
        db.close()


def _seed(db: Session) -> None:
    products = [
        Product(
            id=P1,
            slug="bague-lien-eternel",
            sku="GR-BLE-001",
            name_fr="Bague Lien Éternel By GUMÜÇ Royal",
            name_ar="خاتم الرابط الأبدي — By GUMÜÇROYAL",
            description_short="Le maillon iconique réinventé en anneau ouvert, pavé de zircons taille brillant avec une pierre solitaire en son centre.",
            description_long="Le maillon iconique réinventé en anneau ouvert, pavé de zircons taille brillant avec une pierre solitaire en son centre. Acier inoxydable doré à l'or fin — un éclat qui ne ternit jamais.",
            category="bagues",
            base_price_mad=249,
            compare_at_price_mad=399,
            material="Acier inoxydable 316L, dorure or fin 18K",
            rating=4.9,
            review_count=847,
            badge="Best Seller",
            images=[
                {"url": RING1, "alt": "خاتم", "sort_order": 0},
                {"url": RING2, "alt": "تفاصيل", "sort_order": 1},
                {"url": LIFE, "alt": "مُرتدى", "sort_order": 2},
                {"url": PACK, "alt": "تغليف", "sort_order": 3},
            ],
            benefits=["✨ éclat diamant", "💎 zircons pavés", "🔒 acier 316L", "📐 ajustable", "🎁 boîte cadeau"],
            cross_sell_slug="collier-trefle-lumiere",
            upsell_slug="collier-trefle-lumiere",
            sort_order=1,
        ),
        Product(
            id=P2,
            slug="collier-trefle-lumiere",
            sku="GR-CTL-002",
            name_fr="Collier Trèfle de Lumière By GUMÜÇ Royal",
            name_ar="قلادة البرسيم المضiء — By GUMÜÇROYAL",
            description_short="Une double chaîne délicate ponctuée de quatre trèfles porte-bonheur pavés de zircons étincelants.",
            description_long="Une double chaîne délicate ponctuée de quatre trèfles porte-bonheur pavés de zircons étincelants. L'élégance discrète qui se remarque, en acier inoxydable doré à l'or fin.",
            category="colliers",
            base_price_mad=279,
            compare_at_price_mad=449,
            material="Acier inoxydable 316L",
            rating=4.8,
            review_count=623,
            badge="Porte-Bonheur",
            images=[
                {"url": NECK, "alt": "قلادة", "sort_order": 0},
                {"url": RING1, "alt": "تفاصيل", "sort_order": 1},
                {"url": LIFE, "alt": "مُرتdaة", "sort_order": 2},
                {"url": PACK, "alt": "تغليف", "sort_order": 3},
            ],
            benefits=["🍀 4 trèfles", "✨ double chaîne", "💫 zircons", "🔒 inoxydable", "🎁 cadeau"],
            cross_sell_slug="bague-double-signature",
            upsell_slug="bague-lien-eternel",
            sort_order=2,
        ),
        Product(
            id=P3,
            slug="bague-double-signature",
            sku="GR-BDS-003",
            name_fr="Bague Double Signature By GUMÜÇ Royal",
            name_ar="خاتم التوقيع المزdوج — By GUMÜÇROYAL",
            description_short="Un design architectural à deux extrémités pavées de zircons, ferme et résolument féminin.",
            description_long="Un design architectural à deux extrémités pavées de zircons, ferme et résolument féminin. Forme ouverte ajustable, en acier inoxydable doré à l'or fin.",
            category="bagues",
            base_price_mad=229,
            compare_at_price_mad=369,
            material="Acier inoxydable 316L",
            rating=4.9,
            review_count=512,
            badge="Nouveau",
            images=[
                {"url": RING2, "alt": "خاتم", "sort_order": 0},
                {"url": RING1, "alt": "تفاصيل", "sort_order": 1},
                {"url": LIFE, "alt": "مُرتdى", "sort_order": 2},
                {"url": PACK, "alt": "تغليف", "sort_order": 3},
            ],
            benefits=["💎 design unique", "✨ zircons", "📐 ajustable", "🔒 316L", "🎁 cadeau"],
            cross_sell_slug="collier-trefle-lumiere",
            upsell_slug="collier-trefle-lumiere",
            sort_order=3,
        ),
    ]
    db.add_all(products)

    offers_data = [
        (P1, "22222222-2222-2222-2222-222222222201", "GR-BLE-001-single", "قطعة واحدة", 1, 249, 399, None, False, None, 1),
        (P1, "22222222-2222-2222-2222-222222222202", "GR-BLE-001-duo", "عرض زوجي", 2, 429, 798, 69, True, "⭐ الأكثر طلباً", 2),
        (P1, "22222222-2222-2222-2222-222222222203", "GR-BLE-001-trio", "عرض العائلة", 3, 549, 1197, 198, False, "أفضل قيمة", 3),
        (P2, "22222222-2222-2222-2222-222222222204", "GR-CTL-002-single", "قطعة واحدة", 1, 279, 449, None, False, None, 1),
        (P2, "22222222-2222-2222-2222-222222222205", "GR-CTL-002-duo", "عرض زوجي", 2, 479, 898, 79, True, "⭐ الأكثر طلباً", 2),
        (P2, "22222222-2222-2222-2222-222222222206", "GR-CTL-002-trio", "عرض العائلة", 3, 599, 1347, 238, False, "أفضل قيمة", 3),
        (P3, "22222222-2222-2222-2222-222222222207", "GR-BDS-003-single", "قطعة واحدة", 1, 229, 369, None, False, None, 1),
        (P3, "22222222-2222-2222-2222-222222222208", "GR-BDS-003-duo", "عرض زوجي", 2, 389, 738, 69, True, "⭐ الأكثر طلباً", 2),
        (P3, "22222222-2222-2222-2222-222222222209", "GR-BDS-003-trio", "عرض العائلة", 3, 499, 1107, 188, False, "أفضل قيمة", 3),
    ]
    for pid, oid, slug, label, qty, price, compare, savings, is_default, badge, sort in offers_data:
        db.add(
            Offer(
                id=uuid.UUID(oid),
                product_id=pid,
                slug=slug,
                label_ar=label,
                quantity=qty,
                price_mad=price,
                compare_at_price_mad=compare,
                savings_mad=savings,
                is_default=is_default,
                badge_ar=badge,
                sort_order=sort,
            )
        )
