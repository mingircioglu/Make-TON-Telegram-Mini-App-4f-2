// services/api/utility.js
export const getJettonWallet = async (ownerAddress, jettonAddress) => {
  const response = await fetch(`https://toncenter.com/api/v3/jetton/wallets?jetton_address=${jettonAddress}&owner_address=${ownerAddress}`, {
    method: 'GET',
    headers: { "X-API-Key": "d83e9f6d40be3bce2a149a3cf6ef2ac0d2378060cd06adfa5e728bf4cf6de725" }, // Buraya API anahtarınızı ekleyin
  });
  const data = await response.json();
  return data.jetton_wallets.length > 0 ? data.jetton_wallets[0] : null;
};
