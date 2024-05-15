import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { Auth } from './decorators';
import { ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard } from './guards/auth-google/google-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
    
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user);
  }

  @Post('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    return  this.authService.googleLogin(req.userProfile)
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    // Google redirige aquí después de la autenticación
    // Aquí puedes crear un token JWT, etc.
    return this.authService.googleLogin(req)
  }
  // @Get('private')
  // @UseGuards ( AuthGuard() )
  // testingPrivateRoute(
  //   @GetUser() user : User,
  //   @GetUser('email') email: string
  //   // @Req() request: Express.Request
  // ) {
  //   //console.log(request.user)
  //   return{
  //     ok: true,
  //     messahe: 'Hola mundo private',
  //     user, email
  //   }
  // }

  // @Get('private2')
  // @Auth(ValidRoles.admin)
  // privateRoute2(
  //   @GetUser() user: User
  // ){
  //   return {
  //     ok: true,
  //     message:"Hola Private2",
  //     user
  //   }

  // }

}
