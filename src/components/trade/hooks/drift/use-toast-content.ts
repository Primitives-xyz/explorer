import { useTranslations } from 'next-intl'

export function useToastContent() {
  const t = useTranslations()

  const ERRORS = {
    FEE_CALCULATION_ERR: {
      title: 'Fee Calculation Error',
      content: {
        description:
          'Failed to calculate SSE fees. Please try again or check your inputs.',
        duration: 5000,
      },
    },
    JUP_QUOTE_API_ERR: {
      title: 'Jupiter Quote API Error',
      content: {
        description:
          'Failed to fetch Jupiter Quote API. Please try again later',
        duration: 5000,
      },
    },
    JUP_SWAP_API_ERR: {
      title: 'Jupiter SWAP API Error',
      content: {
        description: 'Failed to fetch Jupiter SWAP API. Please try again later',
        duration: 5000,
      },
    },
    WALLET_CONNETION_ERR: {
      title: 'WALLET ERROR',
      content: {
        description: 'Please connect the solana wallet',
        duration: 5000,
      },
    },
    TX_FAILED_ERR: {
      title: t('trade.transaction_failed'),
      content: {
        description: t('trade.the_swap_transaction_failed_please_try_again'),
        duration: 5000,
      },
    },
    TX_PERPS_ORDER_ERR: {
      title: t('trade.transaction_failed'),
      content: {
        description: 'Failed to Place Perps Order. Please try again later.',
        duration: 5000,
      },
    },
    TX_DEPOSIT_COLLATERAL_ERR: {
      title: t('trade.transaction_failed'),
      content: {
        description: 'Failed to deposit collateral',
        duration: 5000,
      },
    },
    PERPS_ORDER_SIZE_ERR: {
      title: 'Order Size Error',
      content: {
        description: 'Order size must be at least 0.01 SOL',
        duration: 5000,
      },
    },
    DRIFT_CLIENT_INIT_ERR: {
      title: 'Drift Client Error',
      content: {
        description: 'Drift client not initialized',
        duration: 5000,
      },
    },
    PERPS_MARKET_ERR: {
      title: 'Perpetual Market Error',
      content: {
        description: 'Perpetual Market Not Found',
        duration: 5000,
      },
    },
    PERPS_MARKET_ACCOUNT_ERR: {
      title: 'Perpetual Market Account Error',
      content: {
        description: 'Perpetual Market Account Not Found',
        duration: 5000,
      },
    },
    LIMIT_PRICE_LONG_ERR: {
      title: 'Limit Price Error',
      content: {
        description:
          'The limit price is above or equal to the current orderbook ask price',
        duration: 5000,
      },
    },
    LIMIT_PRICE_SHORT_ERR: {
      title: 'Limit Price Error',
      content: {
        description: 'The limit price is below the current ask price',
        duration: 5000,
      },
    },
    CLOSE_POS_ERR: {
      title: 'Close Position Error',
      content: {
        description: 'Failed close position. Please try again later',
        duration: 5000,
      },
    },
    PERPS_USER_ERR: {
      title: 'Drift User Account Error',
      content: {
        description: 'Drift User Not Found',
        duration: 5000,
      },
    },
    FETCH_PERPS_POSITION_ERR: {
      title: 'Fetch Open Positions Error',
      content: {
        description: 'Failed Fetching Open Positions. Please try again later',
        duration: 5000,
      },
    },
    CANCEL_ORDER_TX_ERR: {
      title: t('trade.transaction_failed'),
      content: {
        description: 'Failed Cancel Order, Please try again later',
        duration: 5000,
      },
    },
    WITHDRAW_DEPOSIT_TX_ERR: {
      title: t('trade.transaction_failed'),
      content: {
        description: 'Failed to withdraw deposit, Please try again later',
        duration: 5000,
      },
    },
  }

  const LOADINGS = {
    PREPARING_LOADING: {
      title: t('trade.preparing_swap'),
      content: {
        description: t('trade.preparing_your_swap_transaction'),
        duration: 2000,
      },
    },
    SEND_LOADING: {
      title: t('trade.sending_transaction'),
      content: {
        description: t('trade.please_approve_the_transaction_in_your_wallet'),
        duration: 2000,
      },
    },
    CONFIRM_LOADING: {
      title: t('trade.confirming_transaction'),
      content: {
        description: t('trade.waiting_for_confirmation'),
        duration: 1000000000,
      },
    },
  }

  const SUCCESS = {
    TX_SUCCESS: {
      title: t('trade.transaction_successful'),
      content: {
        description: t(
          'trade.the_swap_transaction_was_successful_creating_shareable_link'
        ),
        duration: 2000,
      },
    },
    PLACE_PERPS_ORDER_TX_SUCCESS: {
      title: t('trade.transaction_successful'),
      content: {
        description: 'Place Perps Order Transaction Success',
        duration: 2000,
      },
    },
    DEPOSIT_COLLATERAL_TX_SUCCESS: {
      title: t('trade.transaction_successful'),
      content: {
        description: 'Deposite Collateral Success',
        duration: 2000,
      },
    },
    CLOSE_POSITION_TX_SUCCESS: {
      title: t('trade.transaction_successful'),
      content: {
        description: 'Close Postion Success',
        duration: 2000,
      },
    },
    CANCEL_ORDER_TX_SUCCESS: {
      title: t('trade.transaction_successful'),
      content: {
        description: 'Cancel Order Success',
        duration: 2000,
      },
    },
    PERPS_WITHDRAW_SUCCESS: {
      title: t('trade.transaction_successful'),
      content: {
        description: 'Withdraw deposit Success',
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
