import { useTranslations } from 'next-intl'

export function useToastContent() {
  const t = useTranslations()

  const ERRORS = {
    FEE_CALCULATION_ERR: {
      title: t('error.fee_calculation.title'),
      content: {
        description: t('error.fee_calculation.description'),
        duration: 5000,
      },
    },
    JUP_QUOTE_API_ERR: {
      title: t('error.jup_quote_api.title'),
      content: {
        description: t('error.jup_quote_api.description'),
        duration: 5000,
      },
    },
    JUP_SWAP_API_ERR: {
      title: t('error.jup_swap_api.title'),
      content: {
        description: t('error.jup_swap_api.description'),
        duration: 5000,
      },
    },
    WALLET_CONNETION_ERR: {
      title: t('error.wallet_connection.title'),
      content: {
        description: t('error.wallet_connection.description'),
        duration: 5000,
      },
    },
    TX_FAILED_ERR: {
      title: t('error.transaction_failed.title'),
      content: {
        description: t('error.transaction_failed.description'),
        duration: 5000,
      },
    },
    TX_PERPS_ORDER_ERR: {
      title: t('error.perps_order.title'),
      content: {
        description: t('error.perps_order.description'),
        duration: 5000,
      },
    },
    TX_DEPOSIT_COLLATERAL_ERR: {
      title: t('error.deposit_collateral.title'),
      content: {
        description: t('error.deposit_collateral.description'),
        duration: 5000,
      },
    },
    PERPS_ORDER_SIZE_ERR: {
      title: t('error.order_size.title'),
      content: {
        description: t('error.order_size.description'),
        duration: 5000,
      },
    },
    DRIFT_CLIENT_INIT_ERR: {
      title: t('error.drift_client.title'),
      content: {
        description: t('error.drift_client.description'),
        duration: 5000,
      },
    },
    PERPS_MARKET_ERR: {
      title: t('error.perps_market.title'),
      content: {
        description: t('error.perps_market.description'),
        duration: 5000,
      },
    },
    PERPS_MARKET_ACCOUNT_ERR: {
      title: t('error.perps_market_account.title'),
      content: {
        description: t('error.perps_market_account.description'),
        duration: 5000,
      },
    },
    LIMIT_PRICE_LONG_ERR: {
      title: t('error.limit_price_long.title'),
      content: {
        description: t('error.limit_price_long.description'),
        duration: 5000,
      },
    },
    LIMIT_PRICE_SHORT_ERR: {
      title: t('error.limit_price_short.title'),
      content: {
        description: t('error.limit_price_short.description'),
        duration: 5000,
      },
    },
    CLOSE_POS_ERR: {
      title: t('error.close_position.title'),
      content: {
        description: t('error.close_position.description'),
        duration: 5000,
      },
    },
    PERPS_USER_ERR: {
      title: t('error.perps_user.title'),
      content: {
        description: t('error.perps_user.description'),
        duration: 5000,
      },
    },
    FETCH_PERPS_POSITION_ERR: {
      title: t('error.fetch_perps_position.title'),
      content: {
        description: t('error.fetch_perps_position.description'),
        duration: 5000,
      },
    },
    CANCEL_ORDER_TX_ERR: {
      title: t('error.cancel_order.title'),
      content: {
        description: t('error.cancel_order.description'),
        duration: 5000,
      },
    },
    WITHDRAW_DEPOSIT_TX_ERR: {
      title: t('error.withdraw_deposit.title'),
      content: {
        description: t('error.withdraw_deposit.description'),
        duration: 5000,
      },
    },
  }

  const LOADINGS = {
    PREPARING_LOADING: {
      title: t('loading.preparing_swap.title'),
      content: {
        description: t('loading.preparing_swap.description'),
        duration: 2000,
      },
    },
    SEND_LOADING: {
      title: t('loading.sending_transaction.title'),
      content: {
        description: t('loading.sending_transaction.description'),
        duration: 2000,
      },
    },
    CONFIRM_LOADING: {
      title: t('loading.confirming_transaction.title'),
      content: {
        description: t('loading.confirming_transaction.description'),
        duration: 1000000000,
      },
    },
  }

  const SUCCESS = {
    TX_SUCCESS: {
      title: t('success.transaction.title'),
      content: {
        description: t('success.transaction.description'),
        duration: 2000,
      },
    },
    PLACE_PERPS_ORDER_TX_SUCCESS: {
      title: t('success.place_perps_order.title'),
      content: {
        description: t('success.place_perps_order.description'),
        duration: 2000,
      },
    },
    DEPOSIT_COLLATERAL_TX_SUCCESS: {
      title: t('success.deposit_collateral.title'),
      content: {
        description: t('success.deposit_collateral.description'),
        duration: 2000,
      },
    },
    CLOSE_POSITION_TX_SUCCESS: {
      title: t('success.close_position.title'),
      content: {
        description: t('success.close_position.description'),
        duration: 2000,
      },
    },
    CANCEL_ORDER_TX_SUCCESS: {
      title: t('success.cancel_order.title'),
      content: {
        description: t('success.cancel_order.description'),
        duration: 2000,
      },
    },
    PERPS_WITHDRAW_SUCCESS: {
      title: t('success.perps_withdraw.title'),
      content: {
        description: t('success.perps_withdraw.description'),
        duration: 2000,
      },
    },
  }

  return {
    ERRORS,
    LOADINGS,
    SUCCESS,
  }
}
