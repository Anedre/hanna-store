import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.contactMessage.deleteMany();

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      dni: "12345678",
      email: "admin@hanna.com",
      name: "Admin",
      lastName: "Hanna",
      phone: "969333173",
      password: hashedAdminPassword,
      role: "ADMIN",
      address: "Av. Javier Prado 1234",
      city: "Lima",
      district: "San Isidro",
      postalCode: "15036",
    },
  });
  console.log("Admin user created:", admin.email);

  // Create mock users for reviews
  const hashedUserPassword = await bcrypt.hash("user1234", 10);
  const mockUsers = await Promise.all(
    [
      { dni: "87654321", email: "maria.garcia@email.com", name: "Maria", lastName: "Garcia" },
      { dni: "11223344", email: "carlos.lopez@email.com", name: "Carlos", lastName: "Lopez" },
      { dni: "55667788", email: "ana.martinez@email.com", name: "Ana", lastName: "Martinez" },
      { dni: "99887766", email: "jose.ramirez@email.com", name: "Jose", lastName: "Ramirez" },
      { dni: "44332211", email: "lucia.fernandez@email.com", name: "Lucia", lastName: "Fernandez" },
    ].map((u) =>
      prisma.user.create({
        data: {
          ...u,
          password: hashedUserPassword,
          role: "USER",
        },
      })
    )
  );
  console.log(`${mockUsers.length} mock users created`);

  // Create categories
  const categoriesData = [
    {
      name: "Tecnologia",
      slug: "tecnologia",
      description: "Gadgets, accesorios y dispositivos tecnologicos importados de las mejores marcas.",
      image: "https://placehold.co/600x400/00B4A0/FFFFFF?text=Tecnologia",
    },
    {
      name: "Hogar",
      slug: "hogar",
      description: "Articulos para el hogar que combinan funcionalidad y diseno moderno.",
      image: "https://placehold.co/600x400/00B4A0/FFFFFF?text=Hogar",
    },
    {
      name: "Moda",
      slug: "moda",
      description: "Ropa y accesorios de tendencia internacional a precios accesibles.",
      image: "https://placehold.co/600x400/00B4A0/FFFFFF?text=Moda",
    },
    {
      name: "Deportes",
      slug: "deportes",
      description: "Equipamiento deportivo y accesorios para mantenerte activo.",
      image: "https://placehold.co/600x400/00B4A0/FFFFFF?text=Deportes",
    },
    {
      name: "Belleza",
      slug: "belleza",
      description: "Productos de belleza y cuidado personal importados de Corea, Japon y mas.",
      image: "https://placehold.co/600x400/00B4A0/FFFFFF?text=Belleza",
    },
    {
      name: "Juguetes",
      slug: "juguetes",
      description: "Juguetes educativos y divertidos para todas las edades.",
      image: "https://placehold.co/600x400/00B4A0/FFFFFF?text=Juguetes",
    },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created.id;
  }
  console.log(`${Object.keys(categories).length} categories created`);

  // Create products (5 per category = 30 total)
  const productsData = [
    // Tecnologia (5)
    {
      name: "Audifonos Bluetooth Pro",
      slug: "audifonos-bluetooth-pro",
      description: "Audifonos inalambricos con cancelacion de ruido activa, bateria de 30 horas y microfono incorporado. Compatibles con todos los dispositivos Bluetooth 5.3. Incluye estuche de carga y cable USB-C.",
      shortDescription: "Audifonos inalambricos con cancelacion de ruido y 30h de bateria.",
      price: 189.90,
      compareAtPrice: 249.90,
      sku: "TEC-AUD-001",
      stock: 45,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Audifonos+Bluetooth"]),
      categoryId: categories["tecnologia"],
      tags: "audifonos,bluetooth,inalambrico,musica",
      weight: "250g",
      origin: "China",
      featured: true,
    },
    {
      name: "Smartwatch Deportivo X200",
      slug: "smartwatch-deportivo-x200",
      description: "Reloj inteligente con monitoreo de frecuencia cardiaca, GPS integrado, resistente al agua IP68. Pantalla AMOLED de 1.4 pulgadas con mas de 100 modos deportivos.",
      shortDescription: "Smartwatch con GPS, monitor cardiaco y resistencia al agua.",
      price: 299.90,
      compareAtPrice: 399.90,
      sku: "TEC-SWT-002",
      stock: 30,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Smartwatch+X200"]),
      categoryId: categories["tecnologia"],
      tags: "smartwatch,reloj,deporte,gps",
      weight: "45g",
      origin: "China",
      featured: true,
    },
    {
      name: "Cargador Inalambrico Rapido 15W",
      slug: "cargador-inalambrico-rapido-15w",
      description: "Cargador inalambrico Qi compatible con iPhone y Android. Carga rapida de 15W con indicador LED y proteccion contra sobrecalentamiento.",
      shortDescription: "Cargador inalambrico Qi de carga rapida 15W.",
      price: 59.90,
      compareAtPrice: null,
      sku: "TEC-CAR-003",
      stock: 100,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Cargador+Inalambrico"]),
      categoryId: categories["tecnologia"],
      tags: "cargador,inalambrico,qi,rapido",
      weight: "120g",
      origin: "China",
      featured: false,
    },
    {
      name: "Hub USB-C 7 en 1",
      slug: "hub-usb-c-7-en-1",
      description: "Hub multipuerto USB-C con HDMI 4K, 2 puertos USB 3.0, lector de tarjetas SD/TF, puerto Ethernet y carga PD de 100W. Ideal para laptops y tablets.",
      shortDescription: "Adaptador USB-C con HDMI 4K, USB 3.0 y carga PD.",
      price: 129.90,
      compareAtPrice: 159.90,
      sku: "TEC-HUB-004",
      stock: 55,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Hub+USB-C"]),
      categoryId: categories["tecnologia"],
      tags: "hub,usb-c,hdmi,adaptador",
      weight: "85g",
      origin: "China",
      featured: false,
    },
    {
      name: "Parlante Portatil Waterproof",
      slug: "parlante-portatil-waterproof",
      description: "Parlante Bluetooth portatil con resistencia al agua IPX7, 24 horas de bateria y sonido envolvente 360. Perfecto para playa, piscina y actividades al aire libre.",
      shortDescription: "Parlante Bluetooth resistente al agua con 24h de bateria.",
      price: 149.90,
      compareAtPrice: null,
      sku: "TEC-PAR-005",
      stock: 35,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Parlante+Waterproof"]),
      categoryId: categories["tecnologia"],
      tags: "parlante,bluetooth,waterproof,portatil",
      weight: "540g",
      origin: "China",
      featured: true,
    },

    // Hogar (5)
    {
      name: "Organizador de Escritorio Bamboo",
      slug: "organizador-escritorio-bamboo",
      description: "Organizador multifuncional de bambu con compartimentos para celular, lapices, tarjetas y accesorios. Diseno minimalista que complementa cualquier escritorio.",
      shortDescription: "Organizador de bambu multifuncional para escritorio.",
      price: 69.90,
      compareAtPrice: 89.90,
      sku: "HOG-ORG-001",
      stock: 60,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Organizador+Bamboo"]),
      categoryId: categories["hogar"],
      tags: "organizador,bambu,escritorio,oficina",
      weight: "450g",
      origin: "China",
      featured: false,
    },
    {
      name: "Lampara LED de Mesa Regulable",
      slug: "lampara-led-mesa-regulable",
      description: "Lampara LED de escritorio con 3 modos de iluminacion y 10 niveles de brillo. Puerto USB de carga, brazo flexible y temporizador automatico. Base estable antideslizante.",
      shortDescription: "Lampara LED con 3 modos de luz y carga USB.",
      price: 99.90,
      compareAtPrice: null,
      sku: "HOG-LAM-002",
      stock: 40,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Lampara+LED"]),
      categoryId: categories["hogar"],
      tags: "lampara,led,escritorio,regulable",
      weight: "680g",
      origin: "China",
      featured: true,
    },
    {
      name: "Set de Tazas Ceramica Japonesa x4",
      slug: "set-tazas-ceramica-japonesa",
      description: "Set de 4 tazas de ceramica artesanal japonesa con disenos tradicionales. Capacidad de 300ml cada una. Aptas para microondas y lavavajillas.",
      shortDescription: "Set de 4 tazas de ceramica japonesa artesanal.",
      price: 79.90,
      compareAtPrice: 99.90,
      sku: "HOG-TAZ-003",
      stock: 25,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Tazas+Japonesas"]),
      categoryId: categories["hogar"],
      tags: "tazas,ceramica,japonesa,set",
      weight: "800g",
      origin: "Japon",
      featured: false,
    },
    {
      name: "Difusor de Aromas Ultrasonico",
      slug: "difusor-aromas-ultrasonico",
      description: "Difusor de aceites esenciales con tecnologia ultrasonica, luz LED de 7 colores y capacidad de 400ml. Temporizador de 1, 3 y 6 horas. Silencioso y elegante.",
      shortDescription: "Difusor ultrasonico con luz LED y 400ml de capacidad.",
      price: 89.90,
      compareAtPrice: null,
      sku: "HOG-DIF-004",
      stock: 50,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Difusor+Aromas"]),
      categoryId: categories["hogar"],
      tags: "difusor,aromas,ultrasonico,led",
      weight: "350g",
      origin: "China",
      featured: false,
    },
    {
      name: "Cortina de Luces LED 3x3m",
      slug: "cortina-luces-led-3x3m",
      description: "Cortina de luces LED decorativa de 3x3 metros con 300 LEDs. 8 modos de iluminacion con control remoto. Perfecta para decoracion de interiores y eventos.",
      shortDescription: "Cortina decorativa 300 LEDs con 8 modos y control remoto.",
      price: 49.90,
      compareAtPrice: 69.90,
      sku: "HOG-COR-005",
      stock: 70,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Cortina+LED"]),
      categoryId: categories["hogar"],
      tags: "luces,led,cortina,decoracion",
      weight: "400g",
      origin: "China",
      featured: true,
    },

    // Moda (5)
    {
      name: "Mochila Urbana Antirrobo",
      slug: "mochila-urbana-antirrobo",
      description: "Mochila con cierre oculto antirrobo, compartimento acolchado para laptop de 15.6 pulgadas, puerto USB externo y material impermeable. Diseno ergonomico para uso diario.",
      shortDescription: "Mochila antirrobo con puerto USB y compartimento para laptop.",
      price: 129.90,
      compareAtPrice: 169.90,
      sku: "MOD-MOC-001",
      stock: 35,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Mochila+Antirrobo"]),
      categoryId: categories["moda"],
      tags: "mochila,antirrobo,urbana,laptop",
      weight: "700g",
      origin: "China",
      featured: true,
    },
    {
      name: "Lentes de Sol Polarizados UV400",
      slug: "lentes-sol-polarizados-uv400",
      description: "Lentes de sol con lentes polarizados y proteccion UV400. Montura ultraligera de TR90 irrompible. Incluye estuche rigido y pano de microfibra.",
      shortDescription: "Lentes polarizados UV400 con montura ultraligera.",
      price: 59.90,
      compareAtPrice: 79.90,
      sku: "MOD-LEN-002",
      stock: 80,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Lentes+Polarizados"]),
      categoryId: categories["moda"],
      tags: "lentes,sol,polarizados,uv400",
      weight: "30g",
      origin: "China",
      featured: false,
    },
    {
      name: "Billetera Slim de Cuero RFID",
      slug: "billetera-slim-cuero-rfid",
      description: "Billetera delgada de cuero genuino con bloqueo RFID. 6 ranuras para tarjetas, compartimento para billetes y bolsillo con cierre. Diseno minimalista y elegante.",
      shortDescription: "Billetera de cuero con proteccion RFID y diseno slim.",
      price: 49.90,
      compareAtPrice: null,
      sku: "MOD-BIL-003",
      stock: 90,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Billetera+RFID"]),
      categoryId: categories["moda"],
      tags: "billetera,cuero,rfid,slim",
      weight: "80g",
      origin: "China",
      featured: false,
    },
    {
      name: "Gorra Snapback Premium",
      slug: "gorra-snapback-premium",
      description: "Gorra snapback de alta calidad con bordado 3D. Visera plana, ajuste trasero de broche metalico. Disponible en multiples colores. Talla unica ajustable.",
      shortDescription: "Gorra snapback con bordado 3D y ajuste metalico.",
      price: 39.90,
      compareAtPrice: null,
      sku: "MOD-GOR-004",
      stock: 120,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Gorra+Snapback"]),
      categoryId: categories["moda"],
      tags: "gorra,snapback,premium,bordado",
      weight: "100g",
      origin: "China",
      featured: false,
    },
    {
      name: "Reloj Casual Minimalista",
      slug: "reloj-casual-minimalista",
      description: "Reloj analogico con correa de malla de acero inoxidable, esfera minimalista y movimiento japones de cuarzo. Resistente al agua 3ATM. Elegante para uso diario.",
      shortDescription: "Reloj analogico minimalista con correa de acero inoxidable.",
      price: 119.90,
      compareAtPrice: 159.90,
      sku: "MOD-REL-005",
      stock: 20,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Reloj+Minimalista"]),
      categoryId: categories["moda"],
      tags: "reloj,minimalista,acero,casual",
      weight: "65g",
      origin: "China",
      featured: true,
    },

    // Deportes (5)
    {
      name: "Zapatillas Running Air Max",
      slug: "zapatillas-running-air-max",
      description: "Zapatillas de running con camara de aire visible, suela de goma antideslizante y malla transpirable. Amortiguacion premium para largas distancias. Ideal para asfalto y pista.",
      shortDescription: "Zapatillas de running con amortiguacion de aire premium.",
      price: 249.90,
      compareAtPrice: 349.90,
      sku: "DEP-ZAP-001",
      stock: 25,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Zapatillas+Running"]),
      categoryId: categories["deportes"],
      tags: "zapatillas,running,deportes,aire",
      weight: "320g",
      origin: "China",
      featured: true,
    },
    {
      name: "Banda de Resistencia Set x5",
      slug: "banda-resistencia-set-x5",
      description: "Set de 5 bandas elasticas de resistencia con diferentes niveles de tension. Incluye bolsa de transporte, anclaje de puerta y asas acolchadas. Perfecto para entrenamiento en casa.",
      shortDescription: "Set de 5 bandas elasticas con accesorios para entrenamiento.",
      price: 69.90,
      compareAtPrice: null,
      sku: "DEP-BAN-002",
      stock: 65,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Bandas+Resistencia"]),
      categoryId: categories["deportes"],
      tags: "bandas,resistencia,fitness,entrenamiento",
      weight: "500g",
      origin: "China",
      featured: false,
    },
    {
      name: "Botella Termica Deportiva 750ml",
      slug: "botella-termica-deportiva-750ml",
      description: "Botella de acero inoxidable de doble pared que mantiene bebidas frias 24h y calientes 12h. Tapa a prueba de derrames con sistema de un solo clic. Libre de BPA.",
      shortDescription: "Botella termica de acero inoxidable 750ml.",
      price: 49.90,
      compareAtPrice: 59.90,
      sku: "DEP-BOT-003",
      stock: 80,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Botella+Termica"]),
      categoryId: categories["deportes"],
      tags: "botella,termica,deportiva,acero",
      weight: "380g",
      origin: "China",
      featured: false,
    },
    {
      name: "Mat de Yoga Antideslizante 6mm",
      slug: "mat-yoga-antideslizante-6mm",
      description: "Colchoneta de yoga de TPE ecologico de 6mm de grosor con doble textura antideslizante. Incluye correa de transporte. Libre de toxicos y facil de limpiar.",
      shortDescription: "Mat de yoga TPE ecologico de 6mm con correa.",
      price: 79.90,
      compareAtPrice: null,
      sku: "DEP-MAT-004",
      stock: 40,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Mat+Yoga"]),
      categoryId: categories["deportes"],
      tags: "yoga,mat,antideslizante,fitness",
      weight: "900g",
      origin: "China",
      featured: false,
    },
    {
      name: "Guantes de Gym con Munequera",
      slug: "guantes-gym-munequera",
      description: "Guantes de entrenamiento con proteccion de palma acolchada y munequera de soporte ajustable. Material transpirable con agarre antideslizante. Ideal para pesas y crossfit.",
      shortDescription: "Guantes de gym con munequera de soporte y palma acolchada.",
      price: 39.90,
      compareAtPrice: 54.90,
      sku: "DEP-GUA-005",
      stock: 55,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Guantes+Gym"]),
      categoryId: categories["deportes"],
      tags: "guantes,gym,fitness,crossfit",
      weight: "150g",
      origin: "China",
      featured: false,
    },

    // Belleza (5)
    {
      name: "Set de Skincare Coreano 5 Pasos",
      slug: "set-skincare-coreano-5-pasos",
      description: "Kit completo de rutina coreana de cuidado facial: limpiador, tonico, serum de vitamina C, crema hidratante y protector solar SPF50. Para todo tipo de piel.",
      shortDescription: "Kit de skincare coreano de 5 pasos con SPF50.",
      price: 159.90,
      compareAtPrice: 219.90,
      sku: "BEL-SKI-001",
      stock: 30,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Skincare+Coreano"]),
      categoryId: categories["belleza"],
      tags: "skincare,coreano,facial,set",
      weight: "650g",
      origin: "Corea del Sur",
      featured: true,
    },
    {
      name: "Mascarillas Faciales Pack x10",
      slug: "mascarillas-faciales-pack-x10",
      description: "Pack de 10 mascarillas faciales de tela con ingredientes naturales: te verde, colageneo, acido hialuronico, arroz y aloe vera. 2 unidades de cada variedad.",
      shortDescription: "Pack de 10 mascarillas faciales con ingredientes naturales.",
      price: 49.90,
      compareAtPrice: null,
      sku: "BEL-MAS-002",
      stock: 75,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Mascarillas+Faciales"]),
      categoryId: categories["belleza"],
      tags: "mascarillas,facial,coreano,pack",
      weight: "250g",
      origin: "Corea del Sur",
      featured: false,
    },
    {
      name: "Cepillo Limpiador Facial Electrico",
      slug: "cepillo-limpiador-facial-electrico",
      description: "Cepillo de limpieza facial de silicona con vibracion sonica. 5 velocidades, resistente al agua IPX7 y carga USB. Limpieza profunda de poros en 60 segundos.",
      shortDescription: "Cepillo facial sonico de silicona con carga USB.",
      price: 89.90,
      compareAtPrice: 119.90,
      sku: "BEL-CEP-003",
      stock: 45,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Cepillo+Facial"]),
      categoryId: categories["belleza"],
      tags: "cepillo,facial,sonico,limpieza",
      weight: "130g",
      origin: "China",
      featured: false,
    },
    {
      name: "Serum Acido Hialuronico 30ml",
      slug: "serum-acido-hialuronico-30ml",
      description: "Serum concentrado de acido hialuronico de triple peso molecular para hidratacion profunda. Formula ligera de rapida absorcion. Apto para pieles sensibles.",
      shortDescription: "Serum de acido hialuronico triple concentracion 30ml.",
      price: 69.90,
      compareAtPrice: null,
      sku: "BEL-SER-004",
      stock: 60,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Serum+Hialuronico"]),
      categoryId: categories["belleza"],
      tags: "serum,hialuronico,hidratante,facial",
      weight: "80g",
      origin: "Corea del Sur",
      featured: false,
    },
    {
      name: "Kit de Brochas de Maquillaje x12",
      slug: "kit-brochas-maquillaje-x12",
      description: "Set profesional de 12 brochas de maquillaje con cerdas sinteticas ultra suaves. Incluye brochas para base, polvo, contorno, sombras y labios. Con estuche de cuero PU.",
      shortDescription: "Set profesional de 12 brochas con estuche de cuero.",
      price: 79.90,
      compareAtPrice: 109.90,
      sku: "BEL-BRO-005",
      stock: 40,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Brochas+Maquillaje"]),
      categoryId: categories["belleza"],
      tags: "brochas,maquillaje,set,profesional",
      weight: "300g",
      origin: "China",
      featured: true,
    },

    // Juguetes (5)
    {
      name: "Robot Educativo Programable",
      slug: "robot-educativo-programable",
      description: "Robot STEM programable por bloques con sensor de obstaculos, LED RGB y altavoz. Compatible con app movil. Mas de 50 proyectos de programacion para ninos de 6 a 12 anos.",
      shortDescription: "Robot programable STEM con app y 50+ proyectos.",
      price: 199.90,
      compareAtPrice: 259.90,
      sku: "JUG-ROB-001",
      stock: 20,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Robot+Educativo"]),
      categoryId: categories["juguetes"],
      tags: "robot,educativo,stem,programable",
      weight: "450g",
      origin: "China",
      featured: true,
    },
    {
      name: "Set de Bloques Magneticos x100",
      slug: "set-bloques-magneticos-x100",
      description: "Set de 100 piezas de bloques de construccion magneticos de colores brillantes. Formas geometricas variadas para estimular la creatividad. Material ABS no toxico.",
      shortDescription: "100 bloques magneticos de colores para construccion creativa.",
      price: 129.90,
      compareAtPrice: null,
      sku: "JUG-BLO-002",
      stock: 35,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Bloques+Magneticos"]),
      categoryId: categories["juguetes"],
      tags: "bloques,magneticos,construccion,educativo",
      weight: "1200g",
      origin: "China",
      featured: false,
    },
    {
      name: "Pista de Carreras Electrica",
      slug: "pista-carreras-electrica",
      description: "Pista de autos electrica de 5.5 metros con 2 autos, looping doble, cambio de carril y luces LED. Control de velocidad variable. Para ninos de 5 anos en adelante.",
      shortDescription: "Pista electrica de 5.5m con 2 autos y looping doble.",
      price: 149.90,
      compareAtPrice: 189.90,
      sku: "JUG-PIS-003",
      stock: 15,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Pista+Carreras"]),
      categoryId: categories["juguetes"],
      tags: "pista,autos,carreras,electrica",
      weight: "1800g",
      origin: "China",
      featured: false,
    },
    {
      name: "Peluche Interactivo Musical",
      slug: "peluche-interactivo-musical",
      description: "Peluche de 30cm con sensor de tacto que reproduce 50 canciones y frases en espanol. Material hipoalergenico lavable. Funciona con 3 pilas AA (incluidas).",
      shortDescription: "Peluche musical con 50 canciones en espanol.",
      price: 59.90,
      compareAtPrice: null,
      sku: "JUG-PEL-004",
      stock: 50,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Peluche+Musical"]),
      categoryId: categories["juguetes"],
      tags: "peluche,musical,interactivo,bebe",
      weight: "300g",
      origin: "China",
      featured: false,
    },
    {
      name: "Kit de Ciencia y Experimentos",
      slug: "kit-ciencia-experimentos",
      description: "Kit cientifico con 80 experimentos de quimica, fisica y biologia para ninos. Incluye manual ilustrado paso a paso, gafas de seguridad y todos los materiales necesarios.",
      shortDescription: "Kit de 80 experimentos cientificos con manual ilustrado.",
      price: 99.90,
      compareAtPrice: 129.90,
      sku: "JUG-KIT-005",
      stock: 30,
      images: JSON.stringify(["https://placehold.co/800x800/00B4A0/FFFFFF?text=Kit+Ciencia"]),
      categoryId: categories["juguetes"],
      tags: "ciencia,experimentos,educativo,stem",
      weight: "1500g",
      origin: "China",
      featured: true,
    },
  ];

  const createdProducts = [];
  for (const product of productsData) {
    const created = await prisma.product.create({ data: product });
    createdProducts.push(created);
  }
  console.log(`${createdProducts.length} products created`);

  // Create reviews (10 reviews from different users on different products)
  const reviewsData = [
    {
      rating: 5,
      comment: "Excelente calidad de sonido y la cancelacion de ruido es impresionante. Muy comodos para uso prolongado.",
      userId: mockUsers[0].id,
      productId: createdProducts[0].id, // Audifonos Bluetooth
      approved: true,
    },
    {
      rating: 4,
      comment: "Muy buen smartwatch por el precio. El GPS funciona bien y la bateria dura bastante.",
      userId: mockUsers[1].id,
      productId: createdProducts[1].id, // Smartwatch
      approved: true,
    },
    {
      rating: 5,
      comment: "La mochila es super practica y el material se siente resistente. El compartimento del laptop esta bien acolchado.",
      userId: mockUsers[2].id,
      productId: createdProducts[10].id, // Mochila Antirrobo
      approved: true,
    },
    {
      rating: 4,
      comment: "Las zapatillas son muy comodas para correr. La amortiguacion se siente genial en largas distancias.",
      userId: mockUsers[3].id,
      productId: createdProducts[15].id, // Zapatillas Running
      approved: true,
    },
    {
      rating: 5,
      comment: "El set de skincare es fantastico. Mi piel se ve mucho mejor despues de 2 semanas de uso.",
      userId: mockUsers[4].id,
      productId: createdProducts[20].id, // Set Skincare
      approved: true,
    },
    {
      rating: 3,
      comment: "Buen producto pero la entrega demoro un poco mas de lo esperado. La calidad esta bien.",
      userId: mockUsers[0].id,
      productId: createdProducts[5].id, // Organizador Bamboo
      approved: true,
    },
    {
      rating: 5,
      comment: "A mi hijo le encanto el robot. Es muy educativo y entretenido. La app funciona perfectamente.",
      userId: mockUsers[1].id,
      productId: createdProducts[25].id, // Robot Educativo
      approved: true,
    },
    {
      rating: 4,
      comment: "Las luces LED se ven hermosas. Facil de instalar y los 8 modos dan variedad.",
      userId: mockUsers[2].id,
      productId: createdProducts[9].id, // Cortina LED
      approved: true,
    },
    {
      rating: 5,
      comment: "Las brochas son de muy buena calidad, suaves y no sueltan pelo. El estuche es practico.",
      userId: mockUsers[3].id,
      productId: createdProducts[24].id, // Kit Brochas
      approved: true,
    },
    {
      rating: 4,
      comment: "La botella mantiene el agua fria todo el dia. El diseno es bonito y no gotea.",
      userId: mockUsers[4].id,
      productId: createdProducts[17].id, // Botella Termica
      approved: true,
    },
  ];

  for (const review of reviewsData) {
    await prisma.review.create({ data: review });
  }
  console.log(`${reviewsData.length} reviews created`);

  // Create newsletter subscribers
  const newsletterData = [
    { email: "suscriptor1@email.com" },
    { email: "suscriptor2@email.com" },
    { email: "suscriptor3@email.com" },
  ];

  for (const sub of newsletterData) {
    await prisma.newsletterSubscriber.create({ data: sub });
  }
  console.log(`${newsletterData.length} newsletter subscribers created`);

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
