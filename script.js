
const nameInput = document.querySelector('#nombre'); 
const emailInput = document.querySelector('#email'); 
const phoneInput = document.querySelector('#telefono'); 
const dateInput = document.querySelector('#date'); 
const sintomsInput = document.querySelector('#sintoms'); 
const paciente = document.querySelector('#lista');


const formulario = document.querySelector('#nueva-cita'); 
const submitButton = document.querySelector('button[type="submit"]')

nameInput.addEventListener('change', datosCita); 
emailInput.addEventListener('change', datosCita); 
phoneInput.addEventListener('change', datosCita); 
dateInput.addEventListener('change', datosCita); 
sintomsInput.addEventListener('change', datosCita); 

formulario.addEventListener('submit', submitCita); 

let editando = false; 


const citaObj = {
    id: generarId(),
    nombre: '',
    email: '',
    telefono: '',
    date: '', 
    sintoms: ''
}

class Notificacion {
    constructor ({texto,tipo}){
        this.texto = texto;
        this.tipo = tipo; 

        this.mostrar(); 
    }

    mostrar(){
        //que no se dupliquen las alertas 
        const alertaExistente = document.querySelector('.alertaRoja, .alertaVerde'); 
        if(alertaExistente){
            return; 
        }

        const alerta = document.createElement('div'); 
        
        this.tipo === 'error' ? alerta.classList.add('alertaRoja') : alerta.classList.add('alertaVerde');  

        alerta.textContent = this.texto; 
        
        formulario.appendChild(alerta); 

        setTimeout(() => {
            alerta.remove(); 
        }, 3000);
    }
}

class AdminCitas{
    constructor () {
        this.citas = []; 
    }

    agregarCita(cita){
        this.citas = [...this.citas, cita]; 
    }

    editar(citaActualizada){
        this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita ); 
        this.mostrar(); 
    }

    eliminar(id){
        this.citas = this.citas.filter(cita => cita.id !== id) //busca el id y si coincide lo elimina 
        this.mostrar(); 
    }


    mostrar(){
        while(paciente.firstChild){
            paciente.removeChild(paciente.firstChild); 
        }

        const lista = document.querySelector('#lista')//obtener el ul donde se mostraran las citas 
        lista.innerHTML = ''; //limpiar html 

        this.citas.forEach(cita => {
            const liCita = document.createElement('li'); 
            liCita.classList.add('lista-cita')

            const paciente = document.createElement('h3');
            paciente.innerHTML = `<span>Paciente: </span> <p>${cita.nombre}</p>`; 

            const email = document.createElement('p'); //p para mostrar la info del correo 
            email.innerHTML = `<span>Email: </span><p> ${cita.email}</p>`; 

            const telefono = document.createElement('p'); 
            telefono.innerHTML = `<span>Teléfono: </span><p> ${cita.telefono}</p>`;

            const fecha = document.createElement('p');
            fecha.innerHTML = `<span>Proxima cita: </span><p>${cita.date}</p>`; 

            const sintoms = document.createElement('p');
            sintoms.classList.add('sintomas'); 
            sintoms.innerHTML = `<span>Síntomas: </span><p> ${cita.sintoms}</p>`;

            //boton para editar 
            const btnEditar = document.createElement('button');
            btnEditar.classList.add('alertaAzul'); 
            btnEditar.innerHTML = 'Editar'; 
            btnEditar.onclick = () => cargarEdicion(cita); 

            //boton para eliminar paciene 
            const btnEliminar = document.createElement('button');
            btnEliminar.classList.add('alertaEliminar'); 
            btnEliminar.innerHTML = 'Eliminar';
            btnEliminar.onclick = () => this.eliminar(cita.id); 

            


            liCita.appendChild(paciente); 
            liCita.appendChild(email); 
            liCita.appendChild(telefono); 
            liCita.appendChild(fecha); 
            liCita.appendChild(sintoms); 
            liCita.appendChild(btnEditar); 
            liCita.appendChild(btnEliminar); 

            //añadir li a la lista 
            lista.appendChild(liCita); 
        })
    }

}

function datosCita(e){
   citaObj[e.target.name] = e.target.value; 
   console.log(citaObj); 
}

const citas = new AdminCitas(); 

function submitCita(e){
    e.preventDefault();

    if(Object.values(citaObj).some(valor => valor.trim() === '')){
        new Notificacion({
            texto: 'Todos los campos son obligatorios',
            tipo: 'error'
        });

        return; //esta linea evita que se envie el formulario 
    } 

    if(!validarEmail(citaObj.email)){
        new Notificacion({
            texto: 'El correo electronico no es valido',
            tipo: 'error'
        })

        return; 
    }

    if(!validarTelefono(citaObj.telefono)){
        new Notificacion({
            texto: 'El numero de telefono no es valido',
            tipo: 'error'
        })

        return; 
    }

    if(!validarFecha(citaObj.date)){
        new Notificacion({
            texto: 'La fecha ingresada no es valida',
            tipo: 'error'
        })

        return; 
    }

    if(editando){
        citas.editar({...citaObj})
        new Notificacion({
            texto: 'Guardado correctamente',
            tipo: 'exito'
        })
    } else {
        citas.agregarCita({...citaObj})
        // Si todo está correcto, mostrar mensaje de éxito
        new Notificacion({
            texto: 'Paciente registrado',
            tipo: 'exito'
        });
    }


    citas.mostrar();
    formulario.reset(); //reinicia el formulario visualmente 
    reiniciarObjetoCita(); //reinicia el objeto 
    submitButton.textContent = 'Crear cita'; 
    editando = false; 
}

function validarEmail(email){
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email); 
}

function validarTelefono(telefono){
    const regex = /^\(?\d{2,3}\)?[\s-]?\d{7,8}$/;
    return regex.test(telefono); 
}

function validarFecha(fecha){
    const [year, month, day] = fecha.split('-').map(Number); 
    const date = new Date(year, month - 1, day); //fecha ingresada
    const hoy = new Date(); //fecha de hoy 

    //reset la hora
    hoy.setHours(0,0,0,0); 

    //validar que la fecha sea logica y no anterior a hoy  
    return (
        date.getFullYear() === year && // Validar el año
        date.getMonth() === month - 1 && // Validar el mes (restar 1 porque los meses en Date empiezan en 0)
        date.getDate() === day && // Validar el día
        date >= hoy // Validar que la fecha no sea anterior a hoy
    ); 
}


function reiniciarObjetoCita(){
    Object.assign(citaObj, {
        id: generarId(), //para generar id unico y que no se replique 
        nombre: '',
        email: '',
        telefono: '',
        date: '', 
        sintoms: ''
    })
}

function generarId(){
    return Math.random().toString(36).substring(2) + Date.now(); 
}

function cargarEdicion(cita){
    reiniciarObjetoCita(); 

    Object.assign(citaObj, cita),
        nameInput.value = cita.nombre; 
        emailInput.value = cita.email; 
        phoneInput.value = cita.telefono; 
        dateInput.value = cita.date; 
        sintomsInput.value = cita.sintoms; 

        editando = true; 


    submitButton.textContent = 'Guardar Cambios'; 
}