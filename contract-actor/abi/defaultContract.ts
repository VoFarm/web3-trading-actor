import { AbiItem } from 'https://deno.land/x/web3@v0.9.2/packages/web3-utils/types/index.d.ts';

export const defaultContract: Array<AbiItem> = [
  {
    'constant': true,
    'inputs': [],
    'name': 'name',
    'outputs': [
      {
        'name': '',
        'type': 'string',
      },
    ],
    'payable': false,
    'type': 'function',
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'decimals',
    'outputs': [
      {
        'name': '',
        'type': 'uint8',
      },
    ],
    'payable': false,
    'type': 'function',
  },
  {
    'constant': true,
    'inputs': [
      {
        'name': '_owner',
        'type': 'address',
      },
    ],
    'name': 'balanceOf',
    'outputs': [
      {
        'name': 'balance',
        'type': 'uint256',
      },
    ],
    'payable': false,
    'type': 'function',
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'symbol',
    'outputs': [
      {
        'name': '',
        'type': 'string',
      },
    ],
    'payable': false,
    'type': 'function',
  },
];
