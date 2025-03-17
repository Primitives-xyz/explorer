/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sse_stake.json`.
 */
export type SseStake = {
  address: 'sse8RjyWVkAoLdRVxfXPECnAKYU232a6DfVF6LJye4s'
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
      name: 'depositFund'
      discriminator: [189, 21, 71, 93, 11, 59, 198, 37]
      accounts: [
        {
          name: 'admin'
          writable: true
          signer: true
        },
        {
          name: 'invester'
          writable: true
          signer: true
        },
        {
          name: 'investerTokenAccount'
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
      args: []
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
      name: 'contractIsStopped'
      msg: 'Contract is stopped'
    },
    {
      code: 6001
      name: 'depositRewardTokenMintError'
      msg: 'reward token mint error'
    },
    {
      code: 6002
      name: 'depositInvesterTokenMintError'
      msg: 'Invester token mint error'
    },
    {
      code: 6003
      name: 'depositInvesterTokenOwnerError'
      msg: 'Invester token owner error'
    },
    {
      code: 6004
      name: 'depositInvesterTokenAmountError'
      msg: 'Invester token Amount error'
    },
    {
      code: 6005
      name: 'youHaveNoWithdrawableAmount'
      msg: 'You have no withdrawable amount'
    },
    {
      code: 6006
      name: 'needMoreTimeToDeposit'
      msg: 'Need more time to deposit.'
    },
    {
      code: 6007
      name: 'valueTooSmall'
      msg: 'valueTooSmall'
    },
    {
      code: 6008
      name: 'valueTooLarge'
      msg: 'valueTooLarge'
    },
    {
      code: 6009
      name: 'valueInvalid'
      msg: 'valueInvalid'
    },
    {
      code: 6010
      name: 'incorrectConfigAccount'
      msg: 'incorrectConfigAccount'
    },
    {
      code: 6011
      name: 'incorrectAuthority'
      msg: 'incorrectAuthority'
    },
    {
      code: 6012
      name: 'overflowOrUnderflowOccurred'
      msg: 'Overflow or underflow occured'
    },
    {
      code: 6013
      name: 'invalidAmount'
      msg: 'Amount is invalid'
    },
    {
      code: 6014
      name: 'arithmeticError'
      msg: 'Arithmetic Error'
    },
    {
      code: 6015
      name: 'invalidParameter'
      msg: 'Invalid Parameter'
    },
    {
      code: 6016
      name: 'invalidArgument'
      msg: 'Invalid Argument'
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
            type: 'f64'
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
            docs: ['reward for one sec']
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
            docs: ['withdrawed Reward Token amount']
            type: 'u64'
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
