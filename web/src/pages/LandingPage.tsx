import { motion } from 'framer-motion';
import {
  ArrowRight, ChefHat, CookingPot, Droplets, Flame, Menu, MessageCircle,
  Plug, Sparkles, Wind, X,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DemoForm from '../components/DemoForm';
import { BRAND, PRODUCTS } from '../lib/constants';

const icons = [ChefHat, CookingPot, Flame, Plug, Droplets, Wind];
const waUrl = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent('Hola, información sobre ANJEYLEADERS')}`;

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function LandingPage() {
  const [menu, setMenu] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src="/brand/logo.png" alt="" className="h-10" />
            <span className="font-serif tracking-wider text-sm hidden sm:block">{BRAND.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#productos" className="hover:text-anje-pink-dark transition-colors">Productos</a>
            <a href="#demo" className="hover:text-anje-pink-dark transition-colors">Demo</a>
            <Link to="/vendedor" className="hover:text-anje-pink-dark transition-colors">Vendedores</Link>
            <a href="#demo" className="btn btn-primary btn-sm">Solicitar demo</a>
          </nav>
          <button type="button" className="md:hidden p-2 rounded-lg border" onClick={() => setMenu(!menu)} aria-label="Menú">
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menu && (
          <motion.nav initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t p-4 flex flex-col gap-2 bg-white">
            <a href="#productos" onClick={() => setMenu(false)} className="p-3 rounded-lg hover:bg-anje-pink-light">Productos</a>
            <a href="#demo" onClick={() => setMenu(false)} className="p-3 rounded-lg hover:bg-anje-pink-light">Demo</a>
            <Link to="/vendedor" onClick={() => setMenu(false)} className="p-3 rounded-lg hover:bg-anje-pink-light">Vendedores</Link>
          </motion.nav>
        )}
      </header>

      <section className="relative overflow-hidden py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-anje-pink-light/40 to-transparent pointer-events-none" />
        <motion.div {...fade} className="relative max-w-3xl mx-auto px-4">
          <motion.img
            src="/brand/logo.png" alt={BRAND.name}
            className="w-56 mx-auto mb-6"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-anje-pink-dark bg-anje-pink-light px-4 py-1.5 rounded-full mb-4">
            <Sparkles size={14} /> {BRAND.slogan}
          </p>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Productos de calidad para tu hogar</h1>
          <p className="text-neutral-600 mb-8 text-lg">Demostración gratuita en tu hogar, centros comerciales y eventos.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#demo" className="btn btn-primary">Solicitar demo <ArrowRight size={18} /></a>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn btn-outline">WhatsApp</a>
          </div>
        </motion.div>
      </section>

      <section id="productos" className="py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fade} className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-anje-pink-dark font-semibold mb-2">Catálogo</p>
            <h2 className="text-3xl font-serif">Nuestros productos</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.map((p, i) => {
              const Icon = icons[i];
              return (
                <motion.article
                  key={p.key}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="card p-8 text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-anje-pink-light flex items-center justify-center text-anje-pink-dark group-hover:bg-gradient-to-br group-hover:from-anje-pink group-hover:to-anje-pink-dark group-hover:text-white transition-all duration-300">
                    <Icon size={28} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-serif text-lg mb-2">{p.label}</h3>
                  <p className="text-neutral-500 text-sm mb-4">{p.desc}</p>
                  <a href="#demo" className="text-sm font-semibold text-anje-pink-dark inline-flex items-center gap-1 hover:gap-2 transition-all">
                    Solicitar demo <ArrowRight size={14} />
                  </a>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="demo" className="py-20">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-start">
          <motion.div {...fade}>
            <h2 className="text-3xl font-serif mb-4">Demostración gratuita</h2>
            <p className="text-neutral-600 mb-6">Experimenta la calidad antes de decidir. Sin compromiso.</p>
            <ul className="space-y-3 mb-8">
              {['Sin compromiso de compra', 'Asesoría personalizada', 'Demo en sitio', 'Santo Domingo y alrededores'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm"><span className="w-2 h-2 rounded-full bg-anje-pink" />{t}</li>
              ))}
            </ul>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn btn-dark"><MessageCircle size={18} /> WhatsApp</a>
          </motion.div>
          <motion.div {...fade} transition={{ delay: 0.15 }}>
            <DemoForm />
          </motion.div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-neutral-500 border-t bg-neutral-50">
        <img src="/brand/logo.png" alt="" className="h-12 mx-auto mb-3 opacity-80" />
        <p><strong>{BRAND.name}</strong> · {BRAND.slogan}</p>
        <p className="mt-2">{BRAND.phone} · {BRAND.domain}</p>
      </footer>

      <a href={waUrl} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50" aria-label="WhatsApp">
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
