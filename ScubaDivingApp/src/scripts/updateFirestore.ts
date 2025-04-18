import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from '../services/firebase/config/firebase.config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// The product data from screenshots
const productsData = [
  {
    "category": "regulator",
    "brand": "ScubaPro",
    "competitor": {
      "shopee": "https://shopee.sg/Scubapro-MK19-EVO-BT-G260-Carbon-BT-Diving-Regulator-i.554890954.19359562186?is_from_login=true",
      "lazada": "https://www.lazada.sg/products/scubapro-mk19-evo-bt-g260-carbon-bt-diving-regulator-i3015598924-s20850107955.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253AMK19%252BEVO%252B%25252B%252BG260%252BCarbon%252BBT%253Bnid%253A3015598924%253Bsrc%253ALazadaMainSrp%253Brn%253A21e57ba3aa81c4f7b5f0d15e371ec3aa%253Bregion%253Asg%253Bsku%253A3015598924_SGAMZ%253Bprice%253A1585%253Bclient%253Adesktop%253Bsupplier_id%253A1171113020%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.sg%252F%253Bslot%253A2%253Butlog_bucket_id%253A470687%253Basc_category_id%253A10131%253Bitem_id%253A3015598924%253Bsku_id%253A20850107955%253Bshop_id%253A1756422%253BtemplateInfo%253A116807_A0%25231104_L%2523-1_A3_C%2523107878_D_E%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Singapore&price=1585&priceCompare=skuId%3A20850107955%3Bsource%3Alazada-search-voucher%3Bsn%3A21e57ba3aa81c4f7b5f0d15e371ec3aa%3BoriginPrice%3A158500%3BdisplayPrice%3A158500%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1743918916635&ratingscore=&request_id=21e57ba3aa81c4f7b5f0d15e371ec3aa&review=&sale=0&search=1&source=search&spm=a2o42.searchlist.list.2&stock=1"
    },
    "image": "https://scubawarehouse.com.sg/images/products/regulator/mk19-evo-+-g260-carbon-bt.jpg",
    "id": "1",
    "link": "https://scubawarehouse.com.sg/product/scubapro-mk19evo-bt-g260bt-regulator/",
    "type": "regulator",
    "price": 1299,
    "model": "MK19 EVO + G260 Carbon BT"
  },
  {
    "id": "2",
    "competitor": {
      "lazada": null,
      "shopee": null
    },
    "link": "https://scubawarehouse.com.sg/product/scubapro-mk2-evo-r095-regulator-2/",
    "price": 405,
    "image": "https://scubawarehouse.com.sg/images/products/regulator/mk2-evo-+-r095.jpg",
    "model": "MK2 EVO + R095",
    "category": "regulator",
    "type": "regulator",
    "brand": "ScubaPro"
  },
  {
    "id": "3",
    "link": "https://scubawarehouse.com.sg/product/apeks-xl4-regulator-set-3/",
    "model": "XL4 + Regulator",
    "type": "regulator",
    "category": "regulator",
    "brand": "Apeks",
    "price": 799,
    "competitor": {
      "lazada": null,
      "shopee": null
    },
    "image": "https://scubawarehouse.com.sg/images/products/regulator/xl4-+-regulator.jpg"
  },
  {
    "id": "4",
    "link": "https://scubawarehouse.com.sg/product/scubapro-level-bcd/",
    "model": "Level",
    "type": "bcd",
    "category": "BCD",
    "price": 650,
    "brand": "Scubapro",
    "competitor": {
      "lazada": null,
      "shopee": null
    },
    "image": "https://scubawarehouse.com.sg/images/products/bcd/level.jpg"
  },
  {
    "id": "5",
    "competitor": {
      "lazada": null,
      "shopee": null
    },
    "brand": "Scubapro",
    "link": "https://scubawarehouse.com.sg/product/scubapro-litehawk-bcd/",
    "model": "Litehawk",
    "type": "bcd",
    "price": 635,
    "image": "https://scubawarehouse.com.sg/images/products/bcd/litehawk.jpg",
    "category": "BCD"
  },
  {
    "model": "Travelight",
    "image": "https://scubawarehouse.com.sg/images/products/bcd/travelight.jpg",
    "competitor": {
      "shopee": null,
      "lazada": null
    },
    "brand": "Cressi",
    "price": 640,
    "id": "6",
    "type": "bcd",
    "link": "https://scubawarehouse.com.sg/product/cressi-travelight-bcd/",
    "category": "BCD"
  },
  {
    "link": "https://scubawarehouse.com.sg/product/scubapro-mk25-evo-a700-carbon-bt-regulator/",
    "id": "7",
    "image": "https://scubawarehouse.com.sg/images/products/regulator/mk25-evo/a700.jpg",
    "price": 1249,
    "category": "regulator",
    "brand": "ScubaPro",
    "competitor": {
      "lazada": "https://www.lazada.sg/products/scubapro-mk25-evo-a700-i2650014466-s17099234219.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253AMK25%252BEVO%25252FA700%253Bnid%253A2650014466%253Bsrc%253ALazadaMainSrp%253Brn%253A199bb0494fd7f073a87a16faad63bd4e%253Bregion%253Asg%253Bsku%253A2650014466_SGAMZ%253Bprice%253A1280%253Bclient%253Adesktop%253Bsupplier_id%253A1171113020%253Bbiz_source%253Ah5_internal%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A10000946%253Bitem_id%253A2650014466%253Bsku_id%253A17099234219%253Bshop_id%253A1756422%253BtemplateInfo%253A116807_A0%25231104_L%2523-1_A3_C%2523107878_D_E%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Singapore&price=1.28E%203&priceCompare=skuId%3A17099234219%3Bsource%3Alazada-search-voucher%3Bsn%3A199bb0494fd7f073a87a16faad63bd4e%3BoriginPrice%3A128000%3BdisplayPrice%3A128000%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1743920399175&ratingscore=&request_id=199bb0494fd7f073a87a16faad63bd4e&review=&sale=0&search=1&source=search&spm=a2o42.searchlist.list.0&stock=1",
      "shopee": "https://shopee.sg/Scubapro-MK25-EVO-A700-Dive-Regulator-System-(Yoke)-i.211062999.29474978175?sp_atk=f2095442-c507-46ff-8cdf-528c7823173d&xptdk=f2095442-c507-46ff-8cdf-528c7823173d"
    },
    "model": "MK25 EVO/A700",
    "type": "regulator"
  },
  {
    "model": "MTX-RC + Regulator",
    "link": "https://scubawarehouse.com.sg/product/apeks-mtx-rc-regulator/",
    "id": "8",
    "category": "regulator",
    "image": "https://scubawarehouse.com.sg/images/products/regulator/mtx-rc-+-regulator.jpg",
    "brand": "Apeks",
    "competitor": {
      "lazada": null,
      "shopee": null
    },
    "type": "regulator",
    "price": 1399
  }
];

// Regulator details from screenshot
const regulatorsData = [
  {
    "prod_id": "1",
    "high_pressure_port": 2,
    "weights_base_on_yoke": 1310,
    "low_pressure_port": 5,
    "airflow_at_200bar": "1800 l/min",
    "dive_type": "Recreational / Tech / Contaminated",
    "material": "Carbon fibre front",
    "adjustable_airflow": "YES",
    "category": "regulator",
    "temperature": "Cold water",
    "pre_dive_mode": "YES",
    "id": "1"
  },
  {
    "dive_type": "Recreational",
    "pre_dive_mode": "NO",
    "low_pressure_port": 4,
    "category": "regulator",
    "weights_base_on_yoke": 871,
    "prod_id": "2",
    "airflow_at_200bar": "1400 l/min",
    "temperature": "Cold water",
    "material": "Chrome Plated",
    "high_pressure_port": 1,
    "adjustable_airflow": "NO",
    "id": "2"
  },
  {
    "temperature": "Cold water",
    "high_pressure_port": 2,
    "adjustable_airflow": "NO",
    "weights_base_on_yoke": 1041,
    "airflow_at_200bar": "1500 l/min",
    "dive_type": "Recreational",
    "pre_dive_mode": "YES",
    "low_pressure_port": 3,
    "material": "Satin",
    "prod_id": "3",
    "category": "regulator",
    "id": "3"
  }
];

// BCD details from screenshot
const bcdsData = [
  {
    "quick_release": "Yes",
    "type": "Jacket",
    "weight_kg": 2.7,
    "prod_id": "4",
    "no_pockets": 2,
    "back_trim_pocket": "YES",
    "lift_capacity_base_on_largest_size_kg": 17.3,
    "category": "BCD",
    "has_size": "YES",
    "weight_pocket": "Yes",
    "id": "1"
  },
  {
    "category": "BCD",
    "quick_release": "No",
    "has_size": "Yes",
    "weight_pocket": "Yes",
    "no_pockets": 2,
    "back_trim_pocket": "Yes",
    "lift_capacity_base_on_largest_size_kg": 13.2,
    "type": "Backplate",
    "weight_kg": 2.3,
    "prod_id": "5",
    "id": "2"
  },
  {
    "quick_release": "Yes",
    "has_size": "Yes",
    "lift_capacity_base_on_largest_size_kg": 16.3,
    "category": "BCD",
    "weight_kg": 2.8,
    "prod_id": "6",
    "back_trim_pocket": "Yes",
    "type": "Jacket",
    "weight_pocket": "Yes",
    "no_pockets": 2,
    "id": "3"
  }
];

async function updateFirestore() {
  try {
    console.log('Starting Firebase update...');
    
    // Add products collection
    console.log('Adding products...');
    for (const product of productsData) {
      await setDoc(doc(db, 'products', product.id), product);
      console.log(`Added product: ${product.brand} ${product.model}`);
    }
    
    // Add regulators collection
    console.log('Adding regulator details...');
    for (const regulator of regulatorsData) {
      await setDoc(doc(db, 'regulators', regulator.prod_id), regulator);
      console.log(`Added regulator details for product ID: ${regulator.prod_id}`);
    }
    
    // Add bcds collection
    console.log('Adding BCD details...');
    for (const bcd of bcdsData) {
      await setDoc(doc(db, 'bcds', bcd.prod_id), bcd);
      console.log(`Added BCD details for product ID: ${bcd.prod_id}`);
    }
    
    console.log('Firestore update completed successfully!');
  } catch (error) {
    console.error('Error updating Firestore:', error);
  }
}

// Run the update
updateFirestore(); 