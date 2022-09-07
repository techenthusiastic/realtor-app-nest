import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/user/auth/auth.service';
import { AuthController } from 'src/user/auth/auth.controller';
import { JwtService } from 'src/jwt/jwt.service';

describe('Test Module', () => {
  let app: INestApplication;
  let testService: TestService;

  let getHomeByIdServiceValidResponse: {};

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestModule],
      controllers: [AuthController],
      providers: [TestService, PrismaService, AuthService, JwtService],
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

  it('POST /auth/signup/REALTOR', () => {
    const user = {
      name: 'VALID_NAME',
      phone: '1234567890',
      email: 'mail123@gmail.com',
      password: 'mailuser',
      productKey:
        '$2a$10$w1Z/h9J9bzH0xZfeT5V4aueHopGfk06qF2P7RQjRtqDpABVdttI4u',
    };
    return request(app.getHttpServer())
      .post('/auth/signup/REALTOR')
      .send(user)
      .expect(201);
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
