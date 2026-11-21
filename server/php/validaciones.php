<?php
declare(strict_types=1);

function usuarioValido(string $nombre, bool $registro): bool
{
    // Se mantiene el formato anterior para entrar con cuentas ya registradas.
    if (!preg_match('/\A[a-zA-Z0-9_.-]{3,60}\z/', $nombre)) {
        return false;
    }
    if (!$registro) {
        return true;
    }
    return strlen($nombre) <= 15
        && preg_match('/\A[a-zA-Z][a-zA-Z0-9_.-]*[a-zA-Z0-9]\z/', $nombre) === 1
        && !preg_match('/[_.-]{2}/', $nombre);
}

function nombreVisibleValido(string $nombre): bool
{
    return mb_strlen($nombre) >= 2 && mb_strlen($nombre) <= 100
        && preg_match("/\A\p{L}[\p{L}\p{M} '\\-]*\p{L}\z/u", $nombre) === 1
        && !preg_match("/['-]{2}/", $nombre);
}
