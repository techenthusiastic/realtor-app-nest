import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Test Module', () => {
  let app: INestApplication;
  let testService: TestService;

  let getHomeByIdServiceValidResponse: {};

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestModule],
      providers: [TestService, PrismaService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    testService = moduleRef.get<TestService>(TestService);
    const createHomeServiceResponse = await testService.createHome();
    console.log('Creating Home');
    console.log({ createHomeServiceResponse });

    getHomeByIdServiceValidResponse = {
      id: createHomeServiceResponse.id,
      address: 'VALID_ADDRESS',
      number_of_bedrooms: 43,
      number_of_bathrooms: 43.5,
      city: 'LSMD',
      listed_date: createHomeServiceResponse.listed_date,
      price: 6000,
      land_size: 43,
      propertyType: 'CONDO',
      created_at: createHomeServiceResponse.created_at,
      updated_at: createHomeServiceResponse.updated_at,
      realtor_id: 2,
    };
    getHomeByIdServiceValidResponse = JSON.parse(
      JSON.stringify(getHomeByIdServiceValidResponse),
    );
  });

  it(`/GET test`, () => {
    return request(app.getHttpServer())
      .get('/test')
      .query({ id: getHomeByIdServiceValidResponse['id'] })
      .expect(200)
      .expect(getHomeByIdServiceValidResponse);
  });

  afterAll(async () => {
    await app.close();
  });
});
