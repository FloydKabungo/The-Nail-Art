/* THE NAIL ART · Publicly visible product snapshots, not a live stock feed.
   This is a curated sample, not the shop's entire catalogue.
   Product option labels/prices and bulk tiers below are taken from public product pages.
   Update these records from an owner-authorized catalogue export before a real launch. */
'use strict';
const STORE_URL = 'https://www.thenailart.co.za';
const SHIPPING_ZAR = 120; // Public FAQ delivery flat rate; confirm at checkout.
const STORE_CATEGORIES = [
  ['tips','Nail Tips & Display Nails','Extensions, tips and display sets','N'],
  ['polish','Gel Polish & Polish','Colour, top coats and finishing','G'],
  ['powder','Powder & Gel','Acrylic, builder and poly gel','A'],
  ['liquid','Nail Liquid','Solutions, cleansers and prep','L'],
  ['decor','Nail Decorations','Stones, charms and decals','✦'],
  ['electric','Electric Items','UV lamps and equipment','E'],
  ['files','Nail Filer & Drill Bit','Filing and smooth finishes','F'],
  ['brush','Nail Brush & Dust Brush','Brushes and applicators','B'],
  ['stamp','Stamping System','Plates and stamping art','S'],
  ['sets','Others & Nail Set','Kits and studio extras','K'],
  ['tools','Manicure Tools','Tools, accessories and basics','T']
];
const SOURCE_IMAGES = {
  acrylic: 'https://s3.amazonaws.com/images.ecwid.com/images/11664180/1665058627.jpg',
  acrylic4:'https://d2j6dbq0eux0bg.cloudfront.net/images/11664180/3996847642.png',
  clearance:'https://d2j6dbq0eux0bg.cloudfront.net/images/11664180/3998097113.jpg'
};
const option = (label, values) => ({label, values: values.map(v => typeof v === 'string' ? {label:v, extra:0} : {label:v[0],extra:v[1]})});
const product = (id, name, price, category, extra={}) => ({id,name,price,category, image:'',images:[],status:'',oldPrice:null,sku:'',url:'',options:[],bulk:null,description:'',...extra});
const STORE_PRODUCTS = [
  product('uv-gel','The Nail Art UV Gel 1/2 OZ',15,'powder',{
    sku:'UG001',url:STORE_URL+'/online-store/The-Nail-Art-UV-Gel-1-2-OZ-p428861904',status:'hot',
    options:[option('Color',['1 - Pink','2 - White','3 - Soft Pink','4 - Pearl Pink','5 - Clear','6 - Milk White','7 - Jelly Purple','8 - Jelly Pink','9 - Coral Pink','10 - Deep Nude','11 - Light Pink','12 - Nude'])],
    bulk:{minimum:12,unit:10},description:'Choose your gel colour. Original listing also specifies barcode 800501.'
  }),
  product('soft-tips','Soft Gel Tips 1-12',65,'tips',{
    sku:'NT054',status:'new',url:STORE_URL+'/online-store/Soft-Gel-Tips-1-12-p695641057',
    options:[option('Code',['1 - Oval Medium 550pcs','2 - Long Stiletto 440pcs','3 - French Bamboo 440pcs','6 - Oval Medium 550pcs','10 - Short Trapezoid 550pcs','11 - Long Stiletto 440pcs','12 - French Bamboo 440pcs'])],
    bulk:{minimum:12,unit:45},description:'Full-cover flexible gel nail tips. Choose the exact code before adding to bag.'
  }),
  product('spray-bottle','PET Spray Bottle (various sizes)',2,'tools',{
    sku:'SH024',status:'new',url:STORE_URL+'/online-store/250ml-Spray-Bottle-p407697201',
    options:[option('Size',[['5ml',0],['10ml',0],['50ml',3],['100ml',3],['150ml',3],['250ml',3],['300ml',6],['400ml',6],['500ml',6]])],
    description:'Select a bottle size. Larger sizes carry the price additions shown on the original product page.'
  }),
  product('donuts','Ice Cream & Donuts Nail Art Decoration 20pcs',12,'decor',{
    sku:'NJ065',status:'new',url:STORE_URL+'/online-store/Ice-Cream-%26-Donuts-Nail-Art-Decoration-20pcs-p649141422',
    options:[option('Code',['K-01','K-03','K-06','K-07','K-08','K-09','K-10'])]
  }),
  product('sandalwood','Sandalwood Striping Brush',25,'brush',{
    sku:'MP024',status:'new',url:STORE_URL+'/online-store/Sandalwood-Striping-Brush-p840335759',
    options:[option('Size',['6mm','9mm','12mm','15mm','18mm'])],bulk:{minimum:12,unit:18}
  }),
  product('mini-handheld','18W Mini Handheld UV/LED Nail Lamp',40,'electric',{
    sku:'ET026',status:'new',url:STORE_URL+'/online-store/18W-Mini-Handheld-UV-LED-Nail-Lamp-USB-Powered-p373467894',
    options:[option('Colour',['YZ03-White','YZ03-Pink','YZ04-White','YZ04-Pink'])],
    bulk:{minimum:12,unit:30},description:'Handheld flash-curing nail lamp. The original listing says it needs a USB connection during use.'
  }),
  product('armrest','Nail Arm Rest for Acrylic Nails',300,'tools',{
    sku:'HP005',status:'new',url:STORE_URL+'/online-store/Nail-Arm-Rest-for-Acrylic-Nails-Microfiber-Leather-Nail-Hand-Rest-Cushion-for-Nails-Soft-Hand-Pillow-Footstool-with-4-Stainless-Steel-Stands-Thick-Sponge-Nail-Pillow-for-Nail-Tech-Use-p524474518',
    options:[option('Colour',[['Red',-20],['Dusty Pink',0]])],bulk:{minimum:6,unit:200},description:'Soft hand-rest cushion with stainless steel supports. Listed dimensions: 40 × 15 × 15.6 cm.'
  }),
  product('rhinestones','Rhinestones 1440pcs',20,'decor',{
    sku:'NJ031',status:'new',url:STORE_URL+'/online-store/rhinestones-1440pcs-p113999373',
    options:[option('Colour / Size',['Gold - SS3','Gold - SS4','Gold - SS5','Silver - SS3','Silver - SS4','Silver - SS5','White AB - SS3','White AB - SS4','White AB - SS5'])],
    bulk:{minimum:12,unit:12}
  }),
  product('xy-lace','XY-Lace Stamping Plate',15,'stamp',{
    sku:'NP015',status:'new',url:STORE_URL+'/online-store/XY-Lace-Stamping-Plate-p747000113',
    options:[option('Code',['XY-Lace01','XY-Lace02','XY-Lace03','XY-Lace04','XY-Lace05','XY-Lace06'])],bulk:{minimum:12,unit:10}
  }),
  product('bc-stamp','Nail Stamping Metal Plate - BC',15,'stamp',{
    sku:'NP008',url:STORE_URL+'/online-store/Nail-Stamping-Metal-Plate-BC-p110823777',
    options:[option('Code',['BC05','BC06','BC07','BC09','BC10','BC14','BC19'])],bulk:{minimum:12,unit:10}
  }),
  product('xy-df','XY-DF Stamping Plate',30,'stamp',{
    sku:'NP009',status:'new',url:STORE_URL+'/online-store/XY-DF-Stamping-Plate-9-5%2A14-5-20-styles-p747001331',
    options:[option('Code',Array.from({length:20},(_,i)=>'XY-DF'+String(i+1).padStart(2,'0')))],bulk:{minimum:12,unit:20}
  }),
  product('mini-lamp','Mini UV LED Nail Lamp 6W',20,'electric',{
    sku:'ET013',status:'new',url:STORE_URL+'/online-store/Mini-UV-LED-Nail-Lamp-Portable-Gel-Light-Mouse-Shape-Pocket-Size-Nail-Dryer-with-USB-Cable-for-All-Gel-Polish-and-Detection-Light-6W-p107996846',
    options:[option('Color',['Pink - USB cable'])],bulk:{minimum:10,unit:12},description:'Compact USB foldable curing lamp.'
  }),
  product('xxxl-tips','3XL 240pcs Extra Long Nail Tips',40,'tips',{
    sku:'NT127',status:'new',url:STORE_URL+'/online-store/3XL-240pcs-Extra-Long-Clear-Full-Cover-Artificial-False-Nails-Tips-Extra-Long-No-C-Curve-Acrylic-Nail-Tips-p695187983',bulk:{minimum:12,unit:30},description:'Extra-long clear full-cover nail tips in 12 sizes.'
  }),
  product('full-kit','Manicure Full Kit 35pcs',850,'sets',{
    sku:'MS006',status:'new',url:STORE_URL+'/online-store/Manicure-Full-Kit-35pcs-p173799802',bulk:{minimum:10,unit:620},
    description:'35-piece manicure starter set with brushes, files, tips, acrylic powder, monomer, acetone and accessories.'
  }),
  product('gel-kit','Manicure Gel Kit 24pcs',280,'sets',{
    sku:'MS004',status:'hot',url:STORE_URL+'/online-store/Manicure-Gel-Kit-24pcs-p102236361',bulk:{minimum:12,unit:200},
    description:'Starter kit with gel colours, nail tips, brushes and manicure tools.'
  }),
  product('combo-set','Gel Polish Starter Bundle 1–10',249.90,'sets',{
    sku:'MS033',status:'sale',oldPrice:500,url:STORE_URL+'/online-store/Set-1-10-Gel-polish-nail-lamp-nail-decoration-top-coat-base-coat-brush-filer-sticker-p778291751',
    description:'Lamp, gel polish, base and top coat, stickers, nail art extras, brushes and files.'
  }),
  product('acrylic-set-a','Acrylic 12 colours 10ml powder SET A',120,'powder',{
    image:SOURCE_IMAGES.acrylic,status:'hot',sku:'',url:STORE_URL+'/online-store/Acrylic-12-colours-10ml-powder-SET-A-p236974319'
  }),
  product('acrylic-set-4','12pcs Acrylic Powder Set 4 – 10g',100,'powder',{
    image:SOURCE_IMAGES.acrylic4,status:'new',sku:'AP040',bulk:{minimum:12,unit:75},url:STORE_URL+'/online-store/12pcs-Acrylic-Powder-Set-4-10g-p609526664'
  }),
  product('polish-set-sale','20pcs Manicure Gel Polish Set',199,'polish',{
    image:SOURCE_IMAGES.clearance,status:'sale',oldPrice:500,
    url:STORE_URL+'/online-store/Clearance-Sale-7-5ml-Gel-Polish-10pcs-Different-Colours-Send-random-ONLY-p382717587',
    sku:'Clearance 002',description:'20-piece manicure gel polish set. Public clearance listing; final pricing and availability must be confirmed.'
  }),
  product('powder-120','TNA Acrylic Powder 120ml',95,'powder',{status:'new'}),
  product('powder-28','TNA acrylic Powder 28ml',35,'powder',{status:'hot'}),
  product('hard-gel','Hard Gel 20g',45,'powder',{status:'new'}),
  product('builder-gel','TNA UV/LED Builder Gel 56g',50,'powder',{status:'new'}),
  product('top-coat','AS UV/LED Top Coat (Non-Wipe) 15ml',35,'polish',{status:'sale',oldPrice:50}),
  product('base-coat','AS UV/LED Base Coat 15ml',35,'polish',{status:'sale',oldPrice:50}),
  product('matte-coat','AS UV/LED Matte Top Coat 15ml',35,'polish',{status:'sale',oldPrice:50}),
  product('glitter-decor','12 Grids Flame Rhinestone - Lazer',40,'decor',{status:'new'}),
  product('butterfly-decor','6 Grids 3D Big Butterfly Nail Decoration',45,'decor',{status:'new'}),
  product('mermaid-brush','5pcs Mermaid Manicure Brush Set',35,'brush',{status:'hot'}),
  product('feather-brush','7pcs Purple Feather Manicure Brush',15,'brush',{status:'hot'}),
  product('manicure-brush','5pcs Manicure Brush Set',150,'brush',{status:'new'}),
  product('dual-form','Sandwich Nail Dual Form 180pcs',35,'tips',{status:'new'}),
  product('ballerina-display','240# Ballerina Display Tips',25,'tips',{status:'hot'}),
  product('colour-display','72 Colour Display',12,'tips',{status:'hot'}),
  product('liquid-slip','Slip Solution 120ml',45,'liquid',{status:'hot'}),
  product('file-4-way','4 Way Nail Buffer',12,'files',{status:'hot',needsVerification:true}),
  product('gem-picker','Crystal Gem Picker + Dotting Pen',35,'tools',{status:'hot'}),
  product('sponges','Replace Sponge Heads For Ombre Brush 10pcs',35,'brush',{status:'new'})
];
