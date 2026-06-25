<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        return $request->inertia()
            ? redirect()->intended(Fortify::redirects('login'))
            : response()->json(['two_factor' => false]);
    }
}
