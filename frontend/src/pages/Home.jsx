import { useSelector } from 'react-redux';
import HeroBanner from '../components/home/HeroBanner';
import PromoBanner from '../components/home/PromoBanner';
import SectionHeader from '../components/home/SectionHeader';
import TestimonialSection from '../components/home/TestimonialSection';
import NewsletterSection from '../components/home/NewsletterSection';
import ProductGrid from '../components/product/ProductGrid';
import CategoryCard from '../components/product/CategoryCard';
import useProducts from '../hooks/useProducts';

const Home = () => {
  const categories = useSelector((state) => state.categories.items);

  const featured = useProducts({ featured: 'true', limit: 8, sort: 'newest' });
  const latest = useProducts({ limit: 8, sort: 'newest' });
  const bestSelling = useProducts({ limit: 8, sort: 'popular' });

  return (
    <div>
      <HeroBanner />

      <section className="container-app py-12">
        <SectionHeader title="Shop by Category" subtitle="Find exactly what you're looking for" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      </section>

      <section className="container-app py-6">
        <SectionHeader title="Featured Products" subtitle="Hand-picked favorites, just for you" viewAllTo="/products?featured=true" />
        <ProductGrid products={featured.products} isLoading={featured.isLoading} error={featured.error} onRetry={featured.reload} />
      </section>

      <section className="container-app py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <PromoBanner
            title="Up to 40% off Electronics"
            subtitle="Headphones, smart watches, cameras and more at unbeatable prices."
            ctaLabel="Shop Electronics"
            to="/products?category=electronics"
            tone="dark"
          />
          <PromoBanner
            title="New in Fashion"
            subtitle="Refresh your wardrobe with our latest apparel and footwear drops."
            ctaLabel="Shop Fashion"
            to="/products?category=fashion"
            tone="light"
          />
        </div>
      </section>

      <section className="container-app py-6">
        <SectionHeader title="New Arrivals" subtitle="The latest additions to our catalog" viewAllTo="/products?sort=newest" />
        <ProductGrid products={latest.products} isLoading={latest.isLoading} error={latest.error} onRetry={latest.reload} />
      </section>

      <section className="container-app py-6">
        <SectionHeader title="Best Sellers" subtitle="Loved by thousands of customers" viewAllTo="/products?sort=popular" />
        <ProductGrid products={bestSelling.products} isLoading={bestSelling.isLoading} error={bestSelling.error} onRetry={bestSelling.reload} />
      </section>

      <TestimonialSection />
      <NewsletterSection />
    </div>
  );
};

export default Home;
