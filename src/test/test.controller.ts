import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  getHomeById(@Query('id', ParseIntPipe) id: number) {
    console.log('getHomeById-Controller');
    console.log({ id });
    return this.testService.getHomeById(id);
  }
}
