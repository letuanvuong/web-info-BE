/* eslint-disable @typescript-eslint/no-unused-vars */
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'

import { NodeResolver } from './node.resolver'
import { NodeService } from './node.service'
import { NodeEntity } from './schemas/node.schema'

const mockedNodeData = [
  {
    _id: '658c2440-9397-11eb-a06f-49f4a6e815e3',
    idParent: '',
    name: 'Khoa khám bênh',
    code: 'KKB',
    idAccountingObject: '1asdasdw',
    canSale: true,
    unsignedName: null,
    isActive: true,
    createdAt: 1617609872133,
    updatedAt: 1617609872133,
  },
  {
    _id: '2dcc7190-9397-11eb-af09-6f96af15210d',
    idParent: '',
    name: 'Khoa hồi sức',
    code: 'KHS',
    idAccountingObject: '1ewdw4',
    canSale: false,
    unsignedName: null,
    isActive: true,
    createdAt: 1617609872133,
    updatedAt: 1617609872133,
  },
  {
    _id: '2dcc7195-9397-11eb-af09-6f96af15210d',
    idParent: '2dcc7190-9397-11eb-af09-6f96af15210d',
    name: 'Khoa hồi sức1',
    code: 'KHSSQWE',
    idAccountingObject: '1ewdw4',
    canSale: false,
    unsignedName: null,
    isActive: true,
    createdAt: 1617609872133,
    updatedAt: 1617609872133,
  },
]

const mockCreatedData = {
  _id: '774f292a-95fe-11eb-a8b3-0242ac130003',
  name: 'Khoa dược',
  code: 'KD',
  idAccountingObject: '1',
  canSale: true,
  components: [],
  isActive: true,
  createdAt: 1617609872133,
  updatedAt: 1617609872133,
}

const mockAggregateData = [
  {
    _id: '2dcc7190-9397-11eb-af09-6f96af15210d',
    childrenIds: [['2dcc7195-9397-11eb-af09-6f96af15210d']],
  },
]

const mockedNodeTree = [
  {
    _id: '658c2440-9397-11eb-a06f-49f4a6e815e3',
    idParent: '',
    name: 'Khoa khám bênh',
    code: 'KKB',
    idAccountingObject: '1asdasdw',
    canSale: true,
    unsignedName: null,
    isActive: true,
    createdAt: 1617609872133,
    updatedAt: 1617609872133,
    type: undefined,
    taxCode: undefined,
    phoneNumber: undefined,
    title: 'Khoa khám bênh',
    subtitle: undefined,
    children: [],
    isDirectory: true,
    expanded: true,
  },
  {
    _id: '2dcc7190-9397-11eb-af09-6f96af15210d',
    idParent: '',
    name: 'Khoa hồi sức',
    code: 'KHS',
    idAccountingObject: '1ewdw4',
    canSale: false,
    unsignedName: null,
    isActive: true,
    createdAt: 1617609872133,
    updatedAt: 1617609872133,
    type: undefined,
    taxCode: undefined,
    phoneNumber: undefined,
    title: 'Khoa hồi sức',
    subtitle: undefined,
    children: [
      {
        _id: '2dcc7195-9397-11eb-af09-6f96af15210d',
        idParent: '2dcc7190-9397-11eb-af09-6f96af15210d',
        name: 'Khoa hồi sức1',
        code: 'KHSSQWE',
        idAccountingObject: '1ewdw4',
        canSale: false,
        unsignedName: null,
        isActive: true,
        createdAt: 1617609872133,
        updatedAt: 1617609872133,
        type: undefined,
        taxCode: undefined,
        phoneNumber: undefined,
        title: 'Khoa hồi sức1',
        subtitle: undefined,
        children: [],
        expanded: true,
      },
    ],
    isDirectory: true,
    expanded: true,
  },
]

class NodeModule {
  static find = jest.fn(() => ({
    exec: () => mockedNodeData,
  }))

  static findOne = jest.fn((dto) => {
    let _dto = dto
    const keysDto = Object.keys(dto)
    if (keysDto.includes('$or')) {
      const valuesDto = Object.values(dto).flat(Infinity)
      _dto = Object.assign({}, ...valuesDto)
    }

    return {
      exec: () =>
        mockedNodeData.find((d) =>
          Object.keys(_dto).every((k) => k in d && _dto[k] === d[k]),
        ) || null,
    }
  })

  static updateOne = jest.fn(() => ({
    ok: 1,
  }))

  static aggregate = jest.fn(() => mockAggregateData)

  static updateMany = jest.fn(() => ({
    ok: 1,
  }))

  public save = jest.fn(() => mockCreatedData)
}

describe('Testing node resolver', () => {
  let nodeResolver: NodeResolver

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        NodeResolver,
        {
          provide: NodeResolver,
          useValue: { NodeModule },
        },
      ],
    }).compile()
    nodeResolver = moduleRef.get<NodeResolver>(NodeResolver)
  })

  it('Testing node resolver should be defined', () => {
    expect(nodeResolver).toBeDefined()
  })

  it('Testing getNodeById method', async () => {
    const _id = '658c2440-9397-11eb-a06f-49f4a6e815e3'

    // const data = await nodeResolver.getNodeById(_id)
    // expect(data).toEqual(mockedNodeData[0])
  })

  // it('Testing findNodeMatchAny method', async () => {
  //   const name = 'Khoa khám bênh'
  //   const code = 'KKB'
  //   const data = await nodeService.findNodeMatchAny([{ name }, { code }])
  //   expect(data).toEqual(mockedNodeData[0])
  // })

  // it('Testing getNodes method', async () => {
  //   const data = await nodeService.getNodes()
  //   expect(data).toEqual(mockedNodeData)
  // })

  // it('Testing getNodeTree method', async () => {
  //   const data = await nodeService.getNodeTree()
  //   expect(data).toEqual(mockedNodeTree)
  // })

  // it('Testing createNode method', async () => {
  //   const mockDTO = {

  //     name: 'Khoa dược',
  //     code: 'KD',
  //     idAccountingObject: '1',
  //     canSale: true
  //   }
  //   const data = await nodeService.createNode(mockDTO)
  //   expect(data).toEqual(mockCreatedData)
  // })

  // it('Testing updateNode method', async () => {
  //   const mockId = '658c2440-9397-11eb-a06f-49f4a6e815e3'
  //   const mockDTO = {
  //     name: 'update',
  //     code: 'NEW',
  //     idAccountingObject: '1',
  //     canSale: true
  //   }
  //   const data = await nodeService.updateNode(mockId, mockDTO)
  //   expect(data).toEqual(true)
  // })

  // it('Testing deleteNode method', async () => {
  //   const mockId = '2dcc7190-9397-11eb-af09-6f96af15210d'
  //   const data = await nodeService.deleteNode(mockId)
  //   expect(data).toEqual(true)
  // })
})
