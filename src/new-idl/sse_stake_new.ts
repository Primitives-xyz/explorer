/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sse_stake.json`.
 */
export type SseStake = {
  address: 'sseobVr99LLaERn6JvFDC7E9EjYFdP4ggpM51P9XBHJ'
  metadata: {
    name: 'sseStake'
    version: '0.1.0'
    spec: '0.1.0'
    description: 'Created with Anchor'
  }
  instructions: [
    {
      name: 'acceptAuthority'
      discriminator: [107, 86, 198, 91, 33, 12, 107, 160]
      accounts: [
        {
          name: 'newAdmin'
          writable: true
          signer: true
        },
        {
          name: 'globalConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        }
      ]
      args: []
    },
    {
      name: 'claimReward'
      discriminator: [149, 95, 181, 242, 94, 90, 158, 162]
      accounts: [
        {
          name: 'globalConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: 'globalTokenAccount'
          writable: true
        },
        {
          name: 'userInfo'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [117, 115, 101, 114, 105, 110, 102, 111]
              },
              {
                kind: 'account'
                path: 'user'
              }
            ]
          }
        },
        {
          name: 'user'
          writable: true
          signer: true
        },
        {
          name: 'userTokenAccount'
          writable: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
        {
          name: 'tokenProgram'
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        }
      ]
      args: []
    },
    {
      name: 'closeConfig'
      discriminator: [145, 9, 72, 157, 95, 125, 61, 85]
      accounts: [
        {
          name: 'authority'
          writable: true
          signer: true
        },
        {
          name: 'config'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        }
      ]
      args: []
    },
    {
      name: 'closeOldConfig'
      discriminator: [241, 197, 16, 60, 68, 164, 20, 82]
      accounts: [
        {
          name: 'authority'
          writable: true
          signer: true
        },
        {
          name: 'config'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        }
      ]
      args: []
    },
    {
      name: 'configure'
      discriminator: [245, 7, 108, 117, 95, 196, 54, 217]
      accounts: [
        {
          name: 'payer'
          writable: true
          signer: true
        },
        {
          name: 'config'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        }
      ]
      args: [
        {
          name: 'newConfig'
          type: {
            defined: {
              name: 'config'
            }
          }
        }
      ]
    },
    {
      name: 'configureSustainableRewards'
      discriminator: [252, 17, 100, 205, 75, 69, 127, 200]
      accounts: [
        {
          name: 'admin'
          writable: true
          signer: true
        },
        {
          name: 'globalConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        }
      ]
      args: [
        {
          name: 'emergencyReserveBp'
          type: 'u64'
        },
        {
          name: 'forceNewDistribution'
          type: 'bool'
        },
        {
          name: 'distributionPeriodDays'
          type: {
            option: 'u64'
          }
        }
      ]
    },
    {
      name: 'depositFund'
      discriminator: [189, 21, 71, 93, 11, 59, 198, 37]
      accounts: [
        {
          name: 'admin'
          writable: true
          signer: true
        },
        {
          name: 'investor'
          writable: true
          signer: true
        },
        {
          name: 'investorTokenAccount'
          writable: true
        },
        {
          name: 'globalConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: 'rewardVault'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'account'
                path: 'globalConfig'
              },
              {
                kind: 'const'
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: 'account'
                path: 'global_config.token_mint_config'
                account: 'config'
              }
            ]
            program: {
              kind: 'const'
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: 'tokenMint'
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
        {
          name: 'tokenProgram'
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        },
        {
          name: 'associatedTokenProgram'
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        }
      ]
      args: []
    },
    {
      name: 'distributeTradingFees'
      discriminator: [108, 35, 150, 51, 108, 32, 249, 8]
      accounts: [
        {
          name: 'admin'
          writable: true
          signer: true
        },
        {
          name: 'investor'
          writable: true
          signer: true
        },
        {
          name: 'investorTokenAccount'
          writable: true
        },
        {
          name: 'globalConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: 'rewardVault'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'account'
                path: 'globalConfig'
              },
              {
                kind: 'const'
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: 'account'
                path: 'global_config.token_mint_config'
                account: 'config'
              }
            ]
            program: {
              kind: 'const'
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: 'tokenMint'
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
        {
          name: 'tokenProgram'
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        },
        {
          name: 'associatedTokenProgram'
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        }
      ]
      args: [
        {
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'migrateAccount'
      discriminator: [177, 228, 60, 125, 13, 116, 44, 84]
      accounts: [
        {
          name: 'globalConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: 'oldUserInfo'
          docs: ['The old user account to migrate (65 bytes)']
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [117, 115, 101, 114, 105, 110, 102, 111]
              },
              {
                kind: 'account'
                path: 'user'
              }
            ]
          }
        },
        {
          name: 'user'
          writable: true
          signer: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        }
      ]
      args: []
    },
    {
      name: 'nominateAuthority'
      discriminator: [148, 182, 144, 91, 186, 12, 118, 18]
      accounts: [
        {
          name: 'admin'
          writable: true
          signer: true
        },
        {
          name: 'globalConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        }
      ]
      args: [
        {
          name: 'newAdmin'
          type: 'pubkey'
        }
      ]
    },
    {
      name: 'pause'
      discriminator: [211, 22, 221, 251, 74, 121, 193, 47]
      accounts: [
        {
          name: 'admin'
          writable: true
          signer: true
        },
        {
          name: 'globalConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        }
      ]
      args: [
        {
          name: 'isStop'
          type: 'u8'
        }
      ]
    },
    {
      name: 'stake'
      discriminator: [206, 176, 202, 18, 200, 209, 179, 108]
      accounts: [
        {
          name: 'globalConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: 'globalTokenAccount'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'account'
                path: 'globalConfig'
              },
              {
                kind: 'const'
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: 'account'
                path: 'global_config.token_mint_config'
                account: 'config'
              }
            ]
            program: {
              kind: 'const'
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: 'userInfo'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [117, 115, 101, 114, 105, 110, 102, 111]
              },
              {
                kind: 'account'
                path: 'user'
              }
            ]
          }
        },
        {
          name: 'user'
          writable: true
          signer: true
        },
        {
          name: 'userTokenAccount'
          writable: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
        {
          name: 'tokenProgram'
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        }
      ]
      args: [
        {
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'unstake'
      discriminator: [90, 95, 107, 42, 205, 124, 50, 225]
      accounts: [
        {
          name: 'globalConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: 'globalTokenAccount'
          writable: true
        },
        {
          name: 'userInfo'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [117, 115, 101, 114, 105, 110, 102, 111]
              },
              {
                kind: 'account'
                path: 'user'
              }
            ]
          }
        },
        {
          name: 'user'
          writable: true
          signer: true
        },
        {
          name: 'userTokenAccount'
          writable: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
        {
          name: 'tokenProgram'
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        }
      ]
      args: [
        {
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'withdrawPrincipalOnly'
      discriminator: [219, 0, 191, 43, 112, 80, 115, 13]
      accounts: [
        {
          name: 'globalConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: 'globalTokenAccount'
          writable: true
        },
        {
          name: 'userInfo'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [117, 115, 101, 114, 105, 110, 102, 111]
              },
              {
                kind: 'account'
                path: 'user'
              }
            ]
          }
        },
        {
          name: 'user'
          writable: true
          signer: true
        },
        {
          name: 'userTokenAccount'
          writable: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
        {
          name: 'tokenProgram'
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        }
      ]
      args: [
        {
          name: 'amount'
          type: 'u64'
        }
      ]
    }
  ]
  accounts: [
    {
      name: 'config'
      discriminator: [155, 12, 170, 224, 30, 250, 204, 130]
    },
    {
      name: 'user'
      discriminator: [159, 117, 95, 227, 239, 151, 58, 236]
    }
  ]
  errors: [
    {
      code: 6000
      name: 'invalidArgument'
      msg: 'Invalid argument.'
    },
    {
      code: 6001
      name: 'invalidAccount'
      msg: 'Invalid Account.'
    },
    {
      code: 6002
      name: 'invalidAmount'
      msg: 'Invalid amount.'
    },
    {
      code: 6003
      name: 'youHaveNoWithdrawableAmount'
      msg: 'You have no withdrawable amount.'
    },
    {
      code: 6004
      name: 'invalidFunder'
      msg: 'Invalid Funder.'
    },
    {
      code: 6005
      name: 'incorrectAuthority'
      msg: 'Incorrect Authority.'
    },
    {
      code: 6006
      name: 'youHaveNoWithdrawableDeposit'
      msg: 'You have no withdrawable deposit.'
    },
    {
      code: 6007
      name: 'unauthorized'
      msg: 'unauthorized'
    },
    {
      code: 6008
      name: 'tokenBalanceZero'
      msg: 'Token balance is zero.'
    },
    {
      code: 6009
      name: 'nftBalanceZero'
      msg: 'Nft balance is zero.'
    },
    {
      code: 6010
      name: 'depositRewardTokenError'
      msg: 'Failed to deposit reward token.'
    },
    {
      code: 6011
      name: 'depositinvestorTokenAmountError'
      msg: 'Failed to deposit investor token.'
    },
    {
      code: 6012
      name: 'depositinvestorTokenMintError'
      msg: 'Failed to deposit investor token mint.'
    },
    {
      code: 6013
      name: 'depositinvestorTokenOwnerError'
      msg: 'Failed to deposit investor token owner.'
    },
    {
      code: 6014
      name: 'depositRewardTokenMintError'
      msg: 'Failed to deposit reward token mint.'
    },
    {
      code: 6015
      name: 'contractIsStopped'
      msg: 'Contract is stopped by admin.'
    },
    {
      code: 6016
      name: 'claimTooSoon'
      msg: 'User are attempting to claim soon.'
    },
    {
      code: 6017
      name: 'needMoreTimeToDeposit'
      msg: 'Need more time to deposit.'
    },
    {
      code: 6018
      name: 'valueTooSmall'
      msg: 'valueTooSmall'
    },
    {
      code: 6019
      name: 'valueTooLarge'
      msg: 'valueTooLarge'
    },
    {
      code: 6020
      name: 'valueInvalid'
      msg: 'value invalid'
    },
    {
      code: 6021
      name: 'incorrectConfigAccount'
      msg: 'incorrectConfigAccount'
    },
    {
      code: 6022
      name: 'overflowOrUnderflowOccurred'
      msg: 'Overflow or underflow occured'
    },
    {
      code: 6023
      name: 'arithmeticError'
      msg: 'Arithmetic error'
    },
    {
      code: 6024
      name: 'invalidParameter'
      msg: 'Invalid Parameter'
    },
    {
      code: 6025
      name: 'invalidLockDuration'
      msg: 'Invalid lock duration'
    },
    {
      code: 6026
      name: 'accountNotUnlocked'
      msg: 'Account not unlocked'
    },
    {
      code: 6027
      name: 'invalidAccountOwner'
      msg: 'Invalid account owner'
    },
    {
      code: 6028
      name: 'invalidTokenMint'
      msg: 'Invalid token mint'
    },
    {
      code: 6029
      name: 'noRewardsToClaim'
      msg: 'No rewards to claim'
    },
    {
      code: 6030
      name: 'invalidAccountSize'
      msg: 'Invalid account size.'
    },
    {
      code: 6031
      name: 'insufficientVaultFunds'
      msg: 'Insufficient vault funds to cover withdrawal and maintain reserves'
    },
    {
      code: 6032
      name: 'emergencyStop'
      msg: 'Emergency stop: vault balance below minimum reserves'
    },
    {
      code: 6033
      name: 'exceedsAllocation'
      msg: 'Claim amount exceeds remaining allocation for current distribution period'
    }
  ]
  types: [
    {
      name: 'config'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            docs: ['authority publickey']
            type: 'pubkey'
          },
          {
            name: 'pendingAuthority'
            type: 'pubkey'
          },
          {
            name: 'tokenMintConfig'
            docs: ['stake token mint publickey']
            type: 'pubkey'
          },
          {
            name: 'claimPeriod'
            docs: ['reward token claim period']
            type: 'i64'
          },
          {
            name: 'totalRate'
            docs: ['accumulated reward per token (fixed point 1e12)']
            type: 'u128'
          },
          {
            name: 'totalStakers'
            docs: ['number of stakers']
            type: 'u64'
          },
          {
            name: 'lastRewardTime'
            docs: ['the latest staking time']
            type: 'i64'
          },
          {
            name: 'rewardMultiplier'
            docs: [
              'LEGACY: Keep for compatibility (use current_reward_rate instead)'
            ]
            type: 'u64'
          },
          {
            name: 'currentRewardRate'
            docs: [
              'NEW: Current reward rate per second (scaled by PRECISION 1e12 for fixed-point math)'
            ]
            type: 'u128'
          },
          {
            name: 'distributionPeriod'
            docs: [
              'NEW: Distribution period in seconds (how long to distribute current surplus)'
            ]
            type: 'u64'
          },
          {
            name: 'distributionStartTime'
            docs: ['NEW: When current distribution period started']
            type: 'i64'
          },
          {
            name: 'allocatedRewards'
            docs: [
              'NEW: Total rewards allocated for current distribution period'
            ]
            type: 'u64'
          },
          {
            name: 'distributedRewards'
            docs: ['NEW: Rewards already distributed from current allocation']
            type: 'u64'
          },
          {
            name: 'emergencyReserveBp'
            docs: [
              'NEW: Emergency reserve percentage (basis points, e.g., 1000 = 10%)'
            ]
            type: 'u64'
          },
          {
            name: 'depositTime'
            docs: ['reward token deposit time']
            type: 'i64'
          },
          {
            name: 'totalDeposit'
            docs: ['total stakeed token amount']
            type: 'u64'
          },
          {
            name: 'purchaseAmt'
            docs: ['reward token amount']
            type: 'u64'
          },
          {
            name: 'isStop'
            docs: ['is stopped']
            type: 'u8'
          },
          {
            name: 'initialized'
            type: 'bool'
          },
          {
            name: 'dailyDeposits'
            docs: [
              'DEPRECATED: Remove rolling window fields (keep for migration compatibility)'
            ]
            type: {
              array: ['u64', 30]
            }
          },
          {
            name: 'currentDayIndex'
            type: 'u8'
          },
          {
            name: 'lastDepositDay'
            type: 'i64'
          },
          {
            name: 'avgDailyDeposit'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'user'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'user'
            docs: ['user publickey']
            type: 'pubkey'
          },
          {
            name: 'deposit'
            docs: ['deposted stake token amount']
            type: 'u64'
          },
          {
            name: 'debt'
            docs: ['withdrawed Reward Token amount (fixed point 1e12)']
            type: 'u128'
          },
          {
            name: 'lastUpdate'
            docs: ['the latest staking date']
            type: 'i64'
          },
          {
            name: 'initialized'
            type: 'u8'
          }
        ]
      }
    }
  ]
}
