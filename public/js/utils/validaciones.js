// Reglas del formulario. PHP vuelve a comprobarlas antes de guardar una cuenta.
export function validarAcceso(datos, registro) {
  const nombre = datos.nombre_usuario;
  if (!nombre) return { campo: 'nombre-usuario', mensaje: 'Escribe tu nombre de usuario.' };
  const maximo = registro ? 15 : 60;
  if (nombre.length < 3 || nombre.length > maximo) {
    return { campo: 'nombre-usuario', mensaje: `El usuario debe tener entre 3 y ${maximo} caracteres.` };
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(nombre)) {
    return { campo: 'nombre-usuario', mensaje: 'El usuario admite letras sin tildes, números, punto, guion y guion bajo. No admite espacios ni emojis.' };
  }
  if (registro && (!/^[a-zA-Z][a-zA-Z0-9_.-]*[a-zA-Z0-9]$/.test(nombre) || /[_.-]{2}/.test(nombre))) {
    return { campo: 'nombre-usuario', mensaje: 'Empieza el usuario con una letra y termina con una letra o número. No juntes dos separadores.' };
  }
  if (!datos.password) return { campo: 'password', mensaje: 'Escribe tu contraseña.' };
  const bytes = new TextEncoder().encode(datos.password).length;
  if (bytes < 6 || bytes > 72 || (registro && !datos.password.trim())) {
    return { campo: 'password', mensaje: 'La contraseña debe tener al menos 6 caracteres y un máximo de 72 bytes. No puede contener solo espacios.' };
  }
  if (!registro) return null;

  const visible = datos.nombre_visible;
  const letras = [...visible].length;
  if (letras < 2 || letras > 100 || !/^\p{L}[\p{L}\p{M} '\-]*\p{L}$/u.test(visible) || /['-]{2}/.test(visible)) {
    return { campo: 'nombre-visible', mensaje: 'Escribe un nombre o apodo de 2 a 100 letras. Puedes usar tildes, espacios, apóstrofo y guion; no números ni emojis.' };
  }
  if (!datos.correo || datos.correo.length > 180 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
    return { campo: 'correo', mensaje: 'Escribe un correo válido, por ejemplo nombre@ejemplo.cl.' };
  }
  return null;
}
