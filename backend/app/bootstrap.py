import logging
import uuid

from sqlalchemy.orm import Session, joinedload

from app.database import Base, SessionLocal, engine
from app.models.offer import Offer
from app.models.product import Product
from app.product_catalog import load_catalog
from app.utils.offer_tiers import sync_product_offers

logger = logging.getLogger(__name__)

P1 = uuid.UUID("11111111-1111-1111-1111-111111111101")
P2 = uuid.UUID("11111111-1111-1111-1111-111111111102")
P3 = uuid.UUID("11111111-1111-1111-1111-111111111103")

IMG_BAGE_LIEN = "/Produit/bague-lien-eternel.jpg"
IMG_COLLIER_TREFLE = "/Produit/collier-trefle.jpg"
IMG_BAGE_SIGNATURE = "/Produit/bague-double-signature.jpg"

PRODUCT_PHOTOS: dict[str, dict] = {
    "bague-lien-eternel": {"url": IMG_BAGE_LIEN, "alt": "خاتم الرابط الأبدي", "sort_order": 0},
    "collier-trefle-lumiere": {"url": IMG_COLLIER_TREFLE, "alt": "قلادة البرسيم", "sort_order": 0},
    "bague-double-signature": {"url": IMG_BAGE_SIGNATURE, "alt": "خاتم التوقيع المزdوج", "sort_order": 0},
}


def sync_product_images(db: Session) -> None:
    updated = False
    for slug, image in PRODUCT_PHOTOS.items():
        product = db.query(Product).filter(Product.slug == slug).first()
        if product is None:
            continue
        product.images = [image]
        updated = True
    if updated:
        db.commit()
        logger.info("Product images synced to /Produit/ paths")


def sync_product_prices_from_catalog(db: Session) -> None:
    """Apply base_price_mad from data/products.csv — recalc offer tiers."""
    catalog = load_catalog()
    for slug, row in catalog.items():
        product = db.query(Product).filter(Product.slug == slug).first()
        if not product:
            continue
        base = float(row["base_price_mad"])
        product.base_price_mad = base
        product.compare_at_price_mad = base
        if row["sku"]:
            product.sku = str(row["sku"])
    db.flush()
    sync_all_product_offers(db)
    logger.info("Product prices synced from data/products.csv")


def sync_all_product_offers(db: Session) -> None:
    products = db.query(Product).options(joinedload(Product.offers)).all()
    for product in products:
        sync_product_offers(db, product)
    db.commit()
    logger.info("Product offer tiers synced from base_price_mad")


def init_sqlite_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Product).first():
            sync_product_images(db)
            sync_product_prices_from_catalog(db)
            logger.info("SQLite DB — catalog prices & offers synced")
            return
        _seed(db)
        db.commit()
        sync_product_prices_from_catalog(db)
        logger.info("SQLite DB created and seeded")
    finally:
        db.close()


def _seed(db: Session) -> None:
    catalog = load_catalog()
    products = [
        Product(
            id=P1,
            slug="bague-lien-eternel",
            sku=str(catalog["bague-lien-eternel"]["sku"]),
            name_fr="Bague Lien Éternel By GUMÜÇ Royal",
            name_ar="خاتم الرابط الأبدي By GUMÜÇ Royal",
            description_short="Le maillon iconique réinventé en anneau ouvert, pavé de zircons taille brillant avec une pierre solitaire en son centre.",
            description_long="Le maillon iconique réinventé en anneau ouvert, pavé de zircons taille brillant avec une pierre solitaire en son centre. Acier inoxydable 316L finition dorée — un éclat qui ne ternit jamais.",
            category="bagues",
            base_price_mad=float(catalog["bague-lien-eternel"]["base_price_mad"]),
            compare_at_price_mad=float(catalog["bague-lien-eternel"]["base_price_mad"]),
            material="Acier inoxydable 316L finition dorée",
            rating=0,
            review_count=0,
            badge="Nouveau",
            images=[PRODUCT_PHOTOS["bague-lien-eternel"]],
            benefits=["✨ éclat diamant", "💎 zircons pavés", "🔒 acier 316L", "📐 ajustable", "🎁 boîte cadeau"],
            cross_sell_slug="collier-trefle-lumiere",
            upsell_slug="collier-trefle-lumiere",
            sort_order=1,
        ),
        Product(
            id=P2,
            slug="collier-trefle-lumiere",
            sku=str(catalog["collier-trefle-lumiere"]["sku"]),
            name_fr="Collier Trèfle de Lumière By GUMÜÇ Royal",
            name_ar="قلادة البرسيم المضيء By GUMÜÇ Royal",
            description_short="Une double chaîne délicate ponctuée de quatre trèfles porte-bonheur pavés de zircons étincelants.",
            description_long="Une double chaîne délicate ponctuée de quatre trèfles porte-bonheur pavés de zircons étincelants. L'élégance discrète qui se remarque, en acier inoxydable 316L finition dorée.",
            category="colliers",
            base_price_mad=float(catalog["collier-trefle-lumiere"]["base_price_mad"]),
            compare_at_price_mad=float(catalog["collier-trefle-lumiere"]["base_price_mad"]),
            material="Acier inoxydable 316L finition dorée",
            rating=0,
            review_count=0,
            badge="Porte-Bonheur",
            images=[PRODUCT_PHOTOS["collier-trefle-lumiere"]],
            benefits=["🍀 4 trèfles", "✨ double chaîne", "💫 zircons", "🔒 inoxydable", "🎁 cadeau"],
            cross_sell_slug="bague-double-signature",
            upsell_slug="bague-lien-eternel",
            sort_order=2,
        ),
        Product(
            id=P3,
            slug="bague-double-signature",
            sku=str(catalog["bague-double-signature"]["sku"]),
            name_fr="Bague Double Signature By GUMÜÇ Royal",
            name_ar="خاتم التوقيع المزدوج By GUMÜÇ Royal",
            description_short="Un design architectural à deux extrémités pavées de zircons, ferme et résolument féminin.",
            description_long="Un design architectural à deux extrémités pavées de zircons, ferme et résolument féminin. Forme ouverte ajustable, en acier inoxydable 316L finition dorée.",
            category="bagues",
            base_price_mad=float(catalog["bague-double-signature"]["base_price_mad"]),
            compare_at_price_mad=float(catalog["bague-double-signature"]["base_price_mad"]),
            material="Acier inoxydable 316L finition dorée",
            rating=0,
            review_count=0,
            badge="Nouveau",
            images=[PRODUCT_PHOTOS["bague-double-signature"]],
            benefits=["💎 design unique", "✨ zircons", "📐 ajustable", "🔒 316L", "🎁 cadeau"],
            cross_sell_slug="collier-trefle-lumiere",
            upsell_slug="collier-trefle-lumiere",
            sort_order=3,
        ),
    ]
    db.add_all(products)
    db.flush()

    offers_data = [
        (P1, "22222222-2222-2222-2222-222222222201", "GR-BLE-001-single", "قطعة واحدة", 1, False, None, 1),
        (P1, "22222222-2222-2222-2222-222222222202", "GR-BLE-001-duo", "عرض زوجي", 2, True, "⭐ للهدية", 2),
        (P1, "22222222-2222-2222-2222-222222222203", "GR-BLE-001-pack", "باقة نهائية", 3, False, None, 3),
        (P2, "22222222-2222-2222-2222-222222222204", "GR-CTL-002-single", "قطعة واحدة", 1, False, None, 1),
        (P2, "22222222-2222-2222-2222-222222222205", "GR-CTL-002-duo", "عرض زوجي", 2, True, "⭐ للهدية", 2),
        (P2, "22222222-2222-2222-2222-222222222206", "GR-CTL-002-pack", "باقة نهائية", 3, False, None, 3),
        (P3, "22222222-2222-2222-2222-222222222207", "GR-BDS-003-single", "قطعة واحدة", 1, False, None, 1),
        (P3, "22222222-2222-2222-2222-222222222208", "GR-BDS-003-duo", "عرض زوجي", 2, True, "⭐ للهدية", 2),
        (P3, "22222222-2222-2222-2222-222222222209", "GR-BDS-003-pack", "باقة نهائية", 3, False, None, 3),
    ]
    for pid, oid, slug, label, qty, is_default, badge, sort in offers_data:
        db.add(
            Offer(
                id=uuid.UUID(oid),
                product_id=pid,
                slug=slug,
                label_ar=label,
                quantity=qty,
                price_mad=0,
                compare_at_price_mad=None,
                savings_mad=None,
                is_default=is_default,
                badge_ar=badge,
                sort_order=sort,
            )
        )
