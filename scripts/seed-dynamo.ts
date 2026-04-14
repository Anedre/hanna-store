/**
 * Seed script for DynamoDB tables
 * Run: npx tsx scripts/seed-dynamo.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
});
const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const PREFIX = "Hanna";
const T = {
  users: `${PREFIX}-Users`,
  categories: `${PREFIX}-Categories`,
  products: `${PREFIX}-Products`,
  orders: `${PREFIX}-Orders`,
  reviews: `${PREFIX}-Reviews`,
  newsletter: `${PREFIX}-Newsletter`,
  contactMessages: `${PREFIX}-ContactMessages`,
};

function id() { return crypto.randomUUID(); }
const now = new Date().toISOString();

async function put(table: string, item: any) {
  await dynamo.send(new PutCommand({ TableName: table, Item: item }));
}

async function batchPut(table: string, items: any[]) {
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    await dynamo.send(new BatchWriteCommand({
      RequestItems: { [table]: batch.map(item => ({ PutRequest: { Item: item } })) },
    }));
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("  HANNA - DynamoDB Seed");
  console.log("=".repeat(50));

  // ====== USERS ======
  console.log("\n[1/6] Creating users...");
  const adminPw = await bcrypt.hash("admin123", 10);
  const userPw = await bcrypt.hash("user123", 10);

  const adminId = id();
  const userIds = Array.from({ length: 5 }, () => id());

  await put(T.users, {
    id: adminId, dni: "12345678", email: "admin@hanna.com",
    name: "Admin", lastName: "Hanna", phone: "969333173",
    password: adminPw, role: "ADMIN",
    address: "Av. Javier Prado 1234", city: "Lima", district: "San Isidro",
    postalCode: "15036", createdAt: now, updatedAt: now,
  });

  const mockUsers = [
    { dni: "87654321", email: "maria@email.com", name: "Maria", lastName: "Gutierrez" },
    { dni: "11223344", email: "carlos@email.com", name: "Carlos", lastName: "Mendoza" },
    { dni: "55667788", email: "ana@email.com", name: "Ana", lastName: "Rodriguez" },
    { dni: "99887766", email: "jorge@email.com", name: "Jorge", lastName: "Castillo" },
    { dni: "44332211", email: "lucia@email.com", name: "Lucia", lastName: "Fernandez" },
  ];

  for (let i = 0; i < mockUsers.length; i++) {
    await put(T.users, {
      id: userIds[i], ...mockUsers[i], phone: "9" + String(i + 1).repeat(8),
      password: userPw, role: "USER", createdAt: now, updatedAt: now,
    });
  }
  console.log("  Admin: DNI 12345678 / admin123");
  console.log("  5 mock users created");

  // ====== CATEGORIES ======
  console.log("\n[2/6] Creating categories...");
  const categoriesData = [
    { name: "Tecnologia", slug: "tecnologia", description: "Gadgets y dispositivos tecnologicos importados." },
    { name: "Hogar", slug: "hogar", description: "Articulos para el hogar con diseno moderno." },
    { name: "Moda", slug: "moda", description: "Ropa y accesorios de tendencia internacional." },
    { name: "Deportes", slug: "deportes", description: "Equipamiento deportivo y accesorios fitness." },
    { name: "Belleza", slug: "belleza", description: "Productos de belleza importados de Corea y Japon." },
    { name: "Juguetes", slug: "juguetes", description: "Juguetes educativos para todas las edades." },
  ];

  const catIds: Record<string, string> = {};
  for (const cat of categoriesData) {
    const cid = id();
    catIds[cat.slug] = cid;
    await put(T.categories, {
      id: cid, ...cat, image: `/images/categories/${cat.slug}.png`, createdAt: now,
    });
  }
  console.log("  6 categories created");

  // ====== PRODUCTS ======
  console.log("\n[3/6] Creating products...");
  const productsData = [
    // Tecnologia
    { name: "Audifonos Bluetooth Pro", slug: "audifonos-bluetooth-pro", shortDescription: "Audifonos inalambricos con cancelacion de ruido y 30h de bateria.", description: "Audifonos inalambricos con cancelacion de ruido activa, bateria de 30 horas y microfono incorporado.", price: 189.90, compareAtPrice: 249.90, sku: "TEC-AUD-001", stock: 45, cat: "tecnologia", origin: "China", featured: true, tags: "audifonos,bluetooth" },
    { name: "Smartwatch Deportivo X200", slug: "smartwatch-deportivo-x200", shortDescription: "Smartwatch con GPS, monitor cardiaco y resistencia al agua.", description: "Reloj inteligente con monitoreo de frecuencia cardiaca, GPS integrado, pantalla AMOLED.", price: 299.90, compareAtPrice: 399.90, sku: "TEC-SWT-002", stock: 30, cat: "tecnologia", origin: "China", featured: true, tags: "smartwatch,reloj" },
    { name: "Cargador Inalambrico Rapido 15W", slug: "cargador-inalambrico-rapido-15w", shortDescription: "Cargador Qi compatible con iPhone y Android.", description: "Cargador inalambrico Qi con carga rapida de 15W e indicador LED.", price: 59.90, sku: "TEC-CHG-003", stock: 80, cat: "tecnologia", origin: "China", featured: false, tags: "cargador,inalambrico" },
    { name: "Parlante Portatil Waterproof", slug: "parlante-portatil-waterproof", shortDescription: "Parlante Bluetooth resistente al agua con 12h de bateria.", description: "Parlante portatil con Bluetooth 5.0, resistencia al agua IPX7.", price: 149.90, sku: "TEC-SPK-004", stock: 35, cat: "tecnologia", origin: "China", featured: false, tags: "parlante,bluetooth" },
    { name: "Hub USB-C 7 en 1", slug: "hub-usb-c-7-en-1", shortDescription: "Hub multipuerto con HDMI, USB 3.0 y lector SD.", description: "Hub USB-C con 7 puertos incluido HDMI 4K, 2x USB 3.0, lector SD.", price: 129.90, compareAtPrice: 159.90, sku: "TEC-HUB-005", stock: 50, cat: "tecnologia", origin: "China", featured: false, tags: "hub,usb-c" },
    // Hogar
    { name: "Lampara LED Inteligente RGB", slug: "lampara-led-inteligente-rgb", shortDescription: "Lampara WiFi con 16 millones de colores controlable por app.", description: "Lampara LED inteligente con WiFi, compatible con Alexa y Google Home.", price: 79.90, compareAtPrice: 109.90, sku: "HOG-LAM-001", stock: 60, cat: "hogar", origin: "China", featured: true, tags: "lampara,led,smart" },
    { name: "Organizador de Escritorio Bambu", slug: "organizador-escritorio-bambu", shortDescription: "Organizador minimalista de bambu natural.", description: "Organizador de escritorio fabricado en bambu natural con multiples compartimentos.", price: 49.90, sku: "HOG-ORG-002", stock: 40, cat: "hogar", origin: "Japon", featured: false, tags: "organizador,bambu" },
    { name: "Cortina de Luces LED 3x3m", slug: "cortina-de-luces-led-3x3m", shortDescription: "Cortina decorativa con 300 LEDs y 8 modos.", description: "Cortina de luces LED con 300 bombillas, 8 modos de iluminacion.", price: 49.90, compareAtPrice: 69.90, sku: "HOG-LUC-003", stock: 75, cat: "hogar", origin: "China", featured: false, tags: "luces,decoracion" },
    { name: "Difusor de Aromas Ultrasonico", slug: "difusor-aromas-ultrasonico", shortDescription: "Difusor 300ml con luces LED y temporizador.", description: "Difusor de aromas ultrasonico de 300ml con 7 colores LED.", price: 69.90, sku: "HOG-DIF-004", stock: 55, cat: "hogar", origin: "China", featured: false, tags: "difusor,aromas" },
    { name: "Set de Utensilios de Cocina Silicona", slug: "set-utensilios-cocina-silicona", shortDescription: "Set de 12 utensilios de silicona resistente al calor.", description: "Juego de 12 utensilios de cocina de silicona con mango de madera.", price: 89.90, compareAtPrice: 119.90, sku: "HOG-UTN-005", stock: 30, cat: "hogar", origin: "Alemania", featured: true, tags: "cocina,utensilios" },
    // Moda
    { name: "Lentes de Sol Polarizados UV400", slug: "lentes-sol-polarizados-uv400", shortDescription: "Lentes de sol con proteccion UV400 y marco ultraligero.", description: "Lentes de sol polarizados con proteccion UV400, marco de titanio.", price: 99.90, compareAtPrice: 149.90, sku: "MOD-LEN-001", stock: 100, cat: "moda", origin: "Italia", featured: true, tags: "lentes,sol,uv400" },
    { name: "Mochila Urbana Antirrobo", slug: "mochila-urbana-antirrobo", shortDescription: "Mochila con cierre oculto y puerto USB integrado.", description: "Mochila antirrobo con compartimento para laptop, cierre oculto y USB.", price: 129.90, compareAtPrice: 169.90, sku: "MOD-MOC-002", stock: 45, cat: "moda", origin: "China", featured: true, tags: "mochila,antirrobo" },
    { name: "Reloj Minimalista Acero", slug: "reloj-minimalista-acero", shortDescription: "Reloj elegante con correa de acero inoxidable.", description: "Reloj minimalista con caja de 40mm y correa de acero inoxidable.", price: 159.90, sku: "MOD-REL-003", stock: 25, cat: "moda", origin: "Japon", featured: false, tags: "reloj,minimalista" },
    { name: "Billetera RFID Cuero Premium", slug: "billetera-rfid-cuero-premium", shortDescription: "Billetera de cuero con bloqueo RFID.", description: "Billetera de cuero genuino con tecnologia de bloqueo RFID.", price: 79.90, sku: "MOD-BIL-004", stock: 60, cat: "moda", origin: "Italia", featured: false, tags: "billetera,cuero,rfid" },
    { name: "Zapatillas Running Air Max", slug: "zapatillas-running-air-max", shortDescription: "Zapatillas deportivas con amortiguacion de aire.", description: "Zapatillas para correr con tecnologia de amortiguacion Air Max.", price: 249.90, compareAtPrice: 329.90, sku: "MOD-ZAP-005", stock: 20, cat: "moda", origin: "Vietnam", featured: false, tags: "zapatillas,running" },
    // Deportes
    { name: "Banda de Resistencia Set x5", slug: "banda-resistencia-set-x5", shortDescription: "Set de 5 bandas elasticas con diferentes niveles.", description: "Juego de 5 bandas de resistencia con niveles de tension variados.", price: 39.90, sku: "DEP-BAN-001", stock: 120, cat: "deportes", origin: "China", featured: false, tags: "banda,resistencia" },
    { name: "Botella Termica 750ml", slug: "botella-termica-750ml", shortDescription: "Botella de acero inoxidable que mantiene temperatura 24h.", description: "Botella termica de 750ml en acero inoxidable de doble pared.", price: 59.90, compareAtPrice: 79.90, sku: "DEP-BOT-002", stock: 90, cat: "deportes", origin: "Japon", featured: true, tags: "botella,termica" },
    { name: "Guantes de Gimnasio Pro", slug: "guantes-gimnasio-pro", shortDescription: "Guantes con soporte de muneca y agarre antideslizante.", description: "Guantes de gimnasio con soporte de muneca reforzado.", price: 49.90, sku: "DEP-GUA-003", stock: 70, cat: "deportes", origin: "China", featured: false, tags: "guantes,gimnasio" },
    { name: "Rodillera Deportiva Compresion", slug: "rodillera-deportiva-compresion", shortDescription: "Rodillera de compresion con soporte lateral.", description: "Rodillera deportiva con tejido de compresion y soporte lateral.", price: 34.90, sku: "DEP-ROD-004", stock: 85, cat: "deportes", origin: "China", featured: false, tags: "rodillera,compresion" },
    { name: "Cuerda de Saltar Speed Pro", slug: "cuerda-saltar-speed-pro", shortDescription: "Cuerda de saltar con cable de acero ajustable.", description: "Cuerda de saltar profesional con cable de acero y mangos ergonomicos.", price: 29.90, sku: "DEP-CUE-005", stock: 100, cat: "deportes", origin: "China", featured: false, tags: "cuerda,saltar" },
    // Belleza
    { name: "Set de Skincare Coreano 5 Pasos", slug: "set-skincare-coreano-5-pasos", shortDescription: "Rutina completa de cuidado facial coreano.", description: "Kit de skincare coreano de 5 pasos: limpiador, tonico, serum, crema e hidratante.", price: 159.90, compareAtPrice: 219.90, sku: "BEL-SKN-001", stock: 40, cat: "belleza", origin: "Corea del Sur", featured: true, tags: "skincare,coreano" },
    { name: "Kit de Brochas de Maquillaje x12", slug: "kit-brochas-maquillaje-x12", shortDescription: "Set profesional de 12 brochas con estuche.", description: "Juego de 12 brochas de maquillaje profesional con estuche de viaje.", price: 79.90, compareAtPrice: 109.90, sku: "BEL-BRO-002", stock: 55, cat: "belleza", origin: "Corea del Sur", featured: true, tags: "brochas,maquillaje" },
    { name: "Mascarillas Faciales Pack x10", slug: "mascarillas-faciales-pack-x10", shortDescription: "Pack de 10 mascarillas hidratantes de colageno.", description: "Pack de 10 mascarillas faciales de colageno con acido hialuronico.", price: 49.90, sku: "BEL-MAS-003", stock: 80, cat: "belleza", origin: "Corea del Sur", featured: false, tags: "mascarillas,facial" },
    { name: "Serum Vitamina C 30ml", slug: "serum-vitamina-c-30ml", shortDescription: "Serum facial con vitamina C pura al 20%.", description: "Serum facial concentrado con 20% de vitamina C pura y acido hialuronico.", price: 69.90, sku: "BEL-SER-004", stock: 65, cat: "belleza", origin: "Japon", featured: false, tags: "serum,vitamina-c" },
    { name: "Rizador de Pestanas Calentado", slug: "rizador-pestanas-calentado", shortDescription: "Rizador electrico con control de temperatura.", description: "Rizador de pestanas electrico con calentamiento rapido y control de temperatura.", price: 39.90, sku: "BEL-RIZ-005", stock: 50, cat: "belleza", origin: "Corea del Sur", featured: false, tags: "rizador,pestanas" },
    // Juguetes
    { name: "Robot Educativo Programable", slug: "robot-educativo-programable", shortDescription: "Robot STEM programable para ninos de 6+.", description: "Robot educativo programable con app, ideal para aprender programacion.", price: 199.90, compareAtPrice: 259.90, sku: "JUG-ROB-001", stock: 25, cat: "juguetes", origin: "China", featured: true, tags: "robot,educativo" },
    { name: "Set de Bloques Magneticos x100", slug: "set-bloques-magneticos-x100", shortDescription: "100 bloques magneticos de construccion 3D.", description: "Set de 100 piezas de bloques magneticos para construccion 3D creativa.", price: 149.90, sku: "JUG-BLO-002", stock: 35, cat: "juguetes", origin: "China", featured: false, tags: "bloques,magneticos" },
    { name: "Kit de Ciencia y Experimentos", slug: "kit-de-ciencia-y-experimentos", shortDescription: "Kit con +50 experimentos cientificos para ninos.", description: "Kit educativo con mas de 50 experimentos de ciencia para hacer en casa.", price: 99.90, compareAtPrice: 129.90, sku: "JUG-CIE-003", stock: 45, cat: "juguetes", origin: "USA", featured: false, tags: "ciencia,experimentos" },
    { name: "Pista de Carreras Electrica", slug: "pista-carreras-electrica", shortDescription: "Pista de carreras con 2 autos electricos.", description: "Pista de carreras electrica con 2 coches, bucle y multiples configuraciones.", price: 179.90, compareAtPrice: 229.90, sku: "JUG-PIS-004", stock: 20, cat: "juguetes", origin: "China", featured: false, tags: "pista,carreras" },
    { name: "Peluche Interactivo Musical", slug: "peluche-interactivo-musical", shortDescription: "Peluche suave que canta y cuenta cuentos.", description: "Peluche interactivo que reproduce musica y cuentos, ideal para bebes.", price: 59.90, sku: "JUG-PEL-005", stock: 60, cat: "juguetes", origin: "China", featured: false, tags: "peluche,musical" },
  ];

  const productItems = productsData.map((p) => ({
    id: id(),
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription,
    price: p.price,
    compareAtPrice: p.compareAtPrice || null,
    sku: p.sku,
    stock: p.stock,
    images: JSON.stringify([`/images/products/${p.slug}.png`]),
    categoryId: catIds[p.cat],
    tags: p.tags,
    weight: null,
    origin: p.origin,
    featured: p.featured,
    active: true,
    createdAt: now,
    updatedAt: now,
  }));

  await batchPut(T.products, productItems);
  console.log(`  ${productItems.length} products created`);

  // ====== REVIEWS ======
  console.log("\n[4/6] Creating reviews...");
  const reviewProducts = productItems.filter((p) => p.featured);
  for (let i = 0; i < Math.min(10, reviewProducts.length); i++) {
    const product = reviewProducts[i % reviewProducts.length];
    const userId = userIds[i % userIds.length];
    await put(T.reviews, {
      productId: product.id,
      id: id(),
      rating: 4 + Math.round(Math.random()),
      comment: [
        "Excelente producto, llego rapido y en perfecto estado.",
        "Muy buena calidad, lo recomiendo totalmente.",
        "Buen producto por el precio, cumplio mis expectativas.",
        "Increible, mejor de lo que esperaba. Muy contento con la compra.",
        "Funciona perfecto, el envio fue rapido y seguro.",
      ][i % 5],
      userId,
      approved: true,
      createdAt: now,
    });
  }
  console.log("  10 reviews created");

  // ====== NEWSLETTER ======
  console.log("\n[5/6] Creating newsletter subscribers...");
  for (const email of ["maria@email.com", "carlos@email.com", "ana@email.com"]) {
    await put(T.newsletter, { email, active: true, createdAt: now });
  }
  console.log("  3 subscribers created");

  // ====== DONE ======
  console.log("\n" + "=".repeat(50));
  console.log("  SEED COMPLETE!");
  console.log("  Admin: DNI 12345678 / Password: admin123");
  console.log("=".repeat(50));
}

main().catch(console.error);
