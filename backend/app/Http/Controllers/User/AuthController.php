<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\AuthRegisterRequest;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(AuthRegisterRequest $request)
    {
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Create a Sanctum token for the user
        $token = $user->createToken('auth_token')->plainTextToken;
        $message = 'Registered successfully';
        return $this->responseSenatize($message, $user, $token);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Create a Sanctum token for the user
        $token = $user->createToken('auth_token')->plainTextToken;
        $message = 'Logged in successfully';
        return $this->responseSenatize($message,$user, $token);
    }

    private function responseSenatize($message, $user, $token)
    {
        return response()->json([
            'message' => $message,
            'user' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
            ],
            'token' => $token
        ], 200);
    }

    public function logout(Request $request)
    {
        // Revoke the current user's token
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
