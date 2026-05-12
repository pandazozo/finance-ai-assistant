const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface Broker {
  id: string;
  name: string;
  schema: string;
  stockUrlTemplate: string;
  icon: string;
  appStoreUrl: string;
  downloadUrl: string;
}

export const BROKERS: Broker[] = [
  {
    id: 'huatai',
    name: '华泰证券',
    schema: 'htsc://',
    stockUrlTemplate: 'htsc://stock?code={code}',
    icon: 'htsc',
    appStoreUrl: 'https://apps.apple.com/cn/app/id474297656',
    downloadUrl: 'https://www.htsc.com.cn/'
  },
  {
    id: 'citic',
    name: '中信建投',
    schema: 'cicore://',
    stockUrlTemplate: 'cicore://quote?stockcode={code}',
    icon: 'citic',
    appStoreUrl: 'https://apps.apple.com/cn/app/id589283434',
    downloadUrl: 'https://www.csc108.com/'
  },
  {
    id: 'eastmoney',
    name: '东方财富',
    schema: 'eastmoney://',
    stockUrlTemplate: 'eastmoney://quote?stockcode={code}',
    icon: 'em',
    appStoreUrl: 'https://apps.apple.com/cn/app/id382421038',
    downloadUrl: 'https://www.eastmoney.com/'
  },
  {
    id: 'ths',
    name: '同花顺',
    schema: 'ths://',
    stockUrlTemplate: 'ths://stock?code={code}',
    icon: 'ths',
    appStoreUrl: 'https://apps.apple.com/cn/app/id463279480',
    downloadUrl: 'https://www.10jqka.com.cn/'
  },
  {
    id: 'guotai',
    name: '国泰君安',
    schema: 'gtja://',
    stockUrlTemplate: 'gtja://stock?stockcode={code}',
    icon: 'gtja',
    appStoreUrl: 'https://apps.apple.com/cn/app/id384816470',
    downloadUrl: 'https://www.gtja.com/'
  },
  {
    id: 'pingan',
    name: '平安证券',
    schema: 'pauniversal://',
    stockUrlTemplate: 'pauniversal://stock?stockcode={code}',
    icon: 'pingan',
    appStoreUrl: 'https://apps.apple.com/cn/app/id550506946',
    downloadUrl: 'https://stock.pingan.com/'
  }
];

export const DEFAULT_BROKER_KEY = 'defaultBroker';

export const brokerService = {
  getBrokers(): Broker[] {
    return BROKERS;
  },

  getBrokerById(id: string): Broker | undefined {
    return BROKERS.find(b => b.id === id);
  },

  getDefaultBroker(): Broker {
    const defaultId = localStorage.getItem(DEFAULT_BROKER_KEY) || 'eastmoney';
    return this.getBrokerById(defaultId) || BROKERS[0];
  },

  setDefaultBroker(brokerId: string): void {
    localStorage.setItem(DEFAULT_BROKER_KEY, brokerId);
  },

  normalizeStockCode(code: string): string {
    return code.replace(/^(sh|sz)/, '').trim();
  },

  async checkCanJump(schema: string): Promise<boolean> {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = schema;
      document.body.appendChild(iframe);

      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        resolve(false);
      }, 1000);

      window.addEventListener('blur', function handler() {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        window.removeEventListener('blur', handler);
        resolve(true);
      });
    });
  },

  async jumpToBroker(brokerId: string, stockCode: string): Promise<{ success: boolean; message: string }> {
    const broker = this.getBrokerById(brokerId);
    if (!broker) {
      return { success: false, message: '券商不存在' };
    }

    const normalizedCode = this.normalizeStockCode(stockCode);
    const url = broker.stockUrlTemplate.replace('{code}', normalizedCode);

    try {
      const canJump = await this.checkCanJump(broker.schema);
      
      if (canJump) {
        window.location.href = url;
        return { success: true, message: `正在打开${broker.name}...` };
      } else {
        return { success: false, message: `${broker.name}未安装，是否下载？` };
      }
    } catch (error) {
      console.error('跳转失败:', error);
      return { success: false, message: '跳转失败，请手动打开券商APP' };
    }
  },

  openAppStore(broker: Broker): void {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.location.href = broker.appStoreUrl;
    } else {
      window.location.href = broker.downloadUrl;
    }
  },

  openWeChat(): void {
    window.location.href = 'weixin://';
  },

  openAlipay(): void {
    window.location.href = 'alipays://';
  }
};

export const getBrokerIcon = (brokerId: string): string => {
  const icons: Record<string, string> = {
    huatai: '华',
    citic: '中',
    eastmoney: '东',
    ths: '同',
    guotai: '国',
    pingan: '平'
  };
  return icons[brokerId] || '券';
};

export const getBrokerColor = (brokerId: string): string => {
  const colors: Record<string, string> = {
    huatai: 'bg-blue-500',
    citic: 'bg-orange-500',
    eastmoney: 'bg-red-500',
    ths: 'bg-green-500',
    guotai: 'bg-yellow-500',
    pingan: 'bg-purple-500'
  };
  return colors[brokerId] || 'bg-gray-500';
};
