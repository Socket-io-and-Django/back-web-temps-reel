<script setup>
import {defineEmits, defineProps, onMounted, ref, watch} from 'vue';
const props = defineProps(
    {
      token: String,
      socket: Object
    });
onMounted(()=>{
  socket.emit('chatBot');
});
const emit = defineEmits(['close-chat-bot']);
function closeChatBot () {
  emit('close-chat-bot');
}

const socket = props.socket;
const chatText = ref('')
const messages = ref([])
const inputType = ref('text')
const error = ref('')
let askedInfoType = ''
let vehiculeInfo = {}

let availableAppointmentDatesIndex = []
let availableAppointmentDates = []

let availableRevisionDatesIndex = []
let availableRevisionDates = []

let availableRoadDatesIndex = []
let availableRoadDates = []

let availableOffroadDatesIndex = []
let availableOffroadDates = []

let availableSportDatesIndex = []
let availableSportDates = []

const serverTextColor = 'blue'
const chatContainer = ref(null)

const emitToServer = (emitType, value) => {
    console.log('emit_type', emitType);
    socket.emit(emitType, value)
    if (value !== '') {
        messages.value.push({
            from: 'user',
            txt: emitType === 'send_last_maintenance_date' ? `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}` : chatText.value
        })
    }
    chatText.value = ''
    error.value = ''
}

const handleChatForm = () => {
    if (chatText) {
        if (inputType.value === 'number') {
            let parsedValue = parseInt(chatText.value)
            if (askedInfoType === 'help_choice') {
                if ([1, 2, 3, 4].includes(parsedValue)) {
                    emitToServer('send_help_type', parsedValue)
                } else {
                    error.value = 'Réponse pas entre 1 et 4'
                }
            } else if (askedInfoType === 'year_choice') {
                if (parsedValue >= 1901 && parsedValue <= new Date().getFullYear()) {
                    emitToServer('send_vehicule_year', parsedValue)
                } else {
                    error.value = 'Année non valide'
                }
            } else if (askedInfoType === 'km_since_maintenance_date') {
                if (parsedValue > 0 && parsedValue) {
                    emitToServer('send_km_since_maintenance_date', parsedValue)
                } else {
                    error.value = 'Nombre de kilomètres non valide'
                }
            } else if (askedInfoType === 'do_revision') {
                if ([1, 2].includes(parsedValue)) {
                    emitToServer('send_do_revision', parsedValue)
                } else {
                    error.value = 'Réponse différent de 1 ou 2'
                }
            } else if (askedInfoType === 'usage_type') {
                if ([1, 2, 3].includes(parsedValue)) {
                    emitToServer('send_usage_type', parsedValue)
                } else {
                    error.value = 'Réponse différent de 1, 2 ou 3'
                }
            } else if (askedInfoType === 'contact_type') {
                if ([1, 2].includes(parsedValue)) {
                    emitToServer('send_contact_type', parsedValue)
                } else {
                    error.value = 'Réponse différent de 1 ou 2'
                }
            } else if (askedInfoType === 'appointment_date') {
                if (availableAppointmentDatesIndex.includes(parsedValue)) {
                    emitToServer('send_maintenance_appointment_date', availableAppointmentDates[parsedValue - 1].id)
                } else {
                    error.value = 'Réponse différent des choix proposés'
                }
            } else if (askedInfoType === 'revision_date') {
                if (availableRevisionDatesIndex.includes(parsedValue)) {
                    emitToServer('send_revision_date', availableRevisionDates[parsedValue - 1].id)
                } else {
                    error.value = 'Réponse différent des choix proposés'
                }
            } else if (askedInfoType === 'road_appointment_date') {
                if (availableRoadDatesIndex.includes(parsedValue)) {
                    emitToServer('send_road_appointment_date', availableRoadDates[parsedValue - 1].id)
                } else {
                    error.value = 'Réponse différent des choix proposés'
                }
            }
            else if (askedInfoType === 'offroad_appointment_date') {
                if (availableOffroadDatesIndex.includes(parsedValue)) {
                    emitToServer('send_offroad_appointment_date', availableOffroadDates[parsedValue - 1].id)
                } else {
                    error.value = 'Réponse différent des choix proposés'
                }
            }
            else if (askedInfoType === 'sport_appointment_date') {
                if (availableSportDatesIndex.includes(parsedValue)) {
                    emitToServer('send_sport_appointment_date', availableSportDates[parsedValue - 1].id)
                } else {
                    error.value = 'Réponse différent des choix proposés'
                }
            }
        } else if (inputType.value === 'date') {
            let parsedValue = new Date(chatText.value)
            if (askedInfoType === 'maintenance_date') {
                if (parsedValue.getFullYear() >= vehiculeInfo.vehiculeYear && parsedValue <= new Date()) {
                    emitToServer('send_last_maintenance_date', parsedValue)
                } else {
                    error.value = 'Date non valide'
                }
            }
        }
    }
}

const stopChat = () => {
    messages.value = []
    inputType.value = 'number'
    askedInfoType = 'help_choice'
    chatText.value = ''
    error.value = ''
    socket.emit('reset_bot')
}

// watch((chatText) => {
//     if (inputType === 'number') {

//     }
// })
watch(messages, () => {
    // chatContainer.value.scrollTop = chatContainer.value.scrollIntoView(false)
}, { deep: true })

socket.on('reset_chat', () => {
    stopChat()
})

socket.on('ask_help_type', (res) => {
    messages.value.push({
        from: res.from,
        txt: res.txt
    })
    inputType.value = 'number'
    askedInfoType = 'help_choice'
})

socket.on('ask_vehicule_year', (res) => {
    messages.value.push({
        from: res.from,
        txt: res.txt
    })
    inputType.value = 'number'
    askedInfoType = 'year_choice'
})

socket.on('ask_last_maintenance_date', (res) => {
    vehiculeInfo = res.vehiculeInfo
    messages.value.push({
        from: res.from,
        txt: res.txt
    })
    inputType.value = 'date'
    askedInfoType = 'maintenance_date'
})

socket.on('ask_appointment_date', (res) => {
    vehiculeInfo = res.vehiculeInfo
    availableAppointmentDates = res.txt
    if (availableAppointmentDates.length) {
        messages.value.push({
            from: res.from,
            txt: 'Voici les dates disponibles :'
        })
        availableAppointmentDates.forEach((date, index) => {
            let d = new Date(date.date)
            availableAppointmentDatesIndex.push(index + 1)
            messages.value.push({
                from: 'server',
                txt: `${index + 1} : ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
            })
        });
        inputType.value = 'number'
        askedInfoType = 'appointment_date'
    } else {
        alert(
            `Rendez-vous indisponibles cette semaine et la semaine prochaine. 
Veuillez réessayer à partir de la semaine prochaine`
        )
        stopChat()
        vehiculeInfo = {}
    }
})

socket.on('maintenance_appointment_added', (res) => {
    alert(res.txt)
    stopChat()
    vehiculeInfo = {}
})

socket.on('maintenance_appointment_added_by_other_user', () => {
    console.log(askedInfoType);
    if (askedInfoType === 'appointment_date') {
        console.log('ici');
        messages.value.push({
            from: 'server',
            txt: "Un des rendez-vous n'est plus disponible"
        })
        socket.emit('send_last_maintenance_date', vehiculeInfo.lastMaintenanceDate)
    }
})

socket.on('ask_km_since_last_maintenance', (res) => {
    vehiculeInfo = res.vehiculeInfo
    messages.value.push({
        from: res.from,
        txt: res.txt
    })
    inputType.value = 'number'
    askedInfoType = 'km_since_maintenance_date'
})

socket.on('ask_do_revision', (res) => {
    vehiculeInfo = res.vehiculeInfo
    messages.value.push({
        from: res.from,
        txt: res.txt
    })
    inputType.value = 'number'
    askedInfoType = 'do_revision'
})

socket.on('ask_revision_date', (res) => {
    console.log(res);
    availableRevisionDates = res.txt
    if (availableRevisionDates.length) {
        messages.value.push({
            from: res.from,
            txt: 'Voici les dates disponibles :'
        })
        availableRevisionDates.forEach((date, index) => {
            let d = new Date(date.date)
            availableRevisionDatesIndex.push(index + 1)
            messages.value.push({
                from: 'server',
                txt: `${index + 1} : ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
            })
        });
        inputType.value = 'number'
        askedInfoType = 'revision_date'
    } else {
        alert(
            `Rendez-vous indisponibles cette semaine et la semaine prochaine. 
Veuillez réessayer à partir de la semaine prochaine`
        )
        stopChat()
        vehiculeInfo = {}
    }
})

socket.on('revision_appointment_added', (res) => {
    alert(res.txt)
    stopChat()
    vehiculeInfo = {}
})

socket.on('revision_appointment_added_by_other_user', () => {
    console.log(askedInfoType);
    if (askedInfoType === 'revision_date') {
        console.log('ici');
        messages.value.push({
            from: 'server',
            txt: "Un des rendez-vous n'est plus disponible"
        })
        socket.emit('send_do_revision', 1)
    }
})

socket.on('ask_usage_type', (res) => {
    messages.value.push({
        from: res.from,
        txt: res.txt
    })
    inputType.value = 'number'
    askedInfoType = 'usage_type'
})

socket.on('ask_road_appointment_date', (res) => {
    console.log(res);
    availableRoadDates = res.txt
    if (availableRoadDates.length) {
        messages.value.push({
            from: res.from,
            txt: 'Voici les dates disponibles :'
        })
        availableRoadDates.forEach((date, index) => {
            let d = new Date(date.date)
            availableRoadDatesIndex.push(index + 1)
            messages.value.push({
                from: 'server',
                txt: `${index + 1} : ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
            })
        });
        inputType.value = 'number'
        askedInfoType = 'road_appointment_date'
    } else {
        alert(
            `Rendez-vous indisponibles cette semaine et la semaine prochaine. 
Veuillez réessayer à partir de la semaine prochaine`
        )
        stopChat()
        vehiculeInfo = {}
    }
})

socket.on('road_appointment_added', (res) => {
    alert(res.txt)
    stopChat()
    vehiculeInfo = {}
})

socket.on('road_appointment_added_by_other_user', () => {
    if (askedInfoType === 'road_appointment_date') {
        console.log('ici');
        messages.value.push({
            from: 'server',
            txt: "Un des rendez-vous n'est plus disponible"
        })
        socket.emit('send_usage_type', 1)
    }
})

socket.on('ask_offroad_appointment_date', (res) => {
    console.log(res);
    availableOffroadDates = res.txt
    if (availableOffroadDates.length) {
        messages.value.push({
            from: res.from,
            txt: 'Voici les dates disponibles :'
        })
        availableOffroadDates.forEach((date, index) => {
            let d = new Date(date.date)
            availableOffroadDatesIndex.push(index + 1)
            messages.value.push({
                from: 'server',
                txt: `${index + 1} : ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
            })
        });
        inputType.value = 'number'
        askedInfoType = 'offroad_appointment_date'
    } else {
        alert(
            `Rendez-vous indisponibles cette semaine et la semaine prochaine. 
Veuillez réessayer à partir de la semaine prochaine`
        )
        stopChat()
        vehiculeInfo = {}
    }
})

socket.on('offroad_appointment_added', (res) => {
    alert(res.txt)
    stopChat()
    vehiculeInfo = {}
})

socket.on('offroad_appointment_added_by_other_user', () => {
    console.log('BLABLABALBALA');
    if (askedInfoType === 'offroad_appointment_date') {
        console.log('ici');
        messages.value.push({
            from: 'server',
            txt: "Un des rendez-vous n'est plus disponible"
        })
        socket.emit('send_usage_type', 2)
    }
})

socket.on('ask_sport_appointment_date', (res) => {
    console.log(res);
    availableSportDates = res.txt
    if (availableSportDates.length) {
        messages.value.push({
            from: res.from,
            txt: 'Voici les dates disponibles :'
        })
        availableSportDates.forEach((date, index) => {
            let d = new Date(date.date)
            availableSportDatesIndex.push(index + 1)
            messages.value.push({
                from: 'server',
                txt: `${index + 1} : ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
            })
        });
        inputType.value = 'number'
        askedInfoType = 'sport_appointment_date'
    } else {
        alert(
            `Rendez-vous indisponibles cette semaine et la semaine prochaine. 
Veuillez réessayer à partir de la semaine prochaine`
        )
        stopChat()
        vehiculeInfo = {}
    }
})

socket.on('sport_appointment_added', (res) => {
    alert(res.txt)
    stopChat()
    vehiculeInfo = {}
})

socket.on('sport_appointment_added_by_other_user', () => {
    console.log(askedInfoType);
    if (askedInfoType === 'sport_appointment_date') {
        console.log('ici');
        messages.value.push({
            from: 'server',
            txt: "Un des rendez-vous n'est plus disponible"
        })
        socket.emit('send_usage_type', 3)
    }
})

socket.on('ask_contact_type', (res) => {
    messages.value.push({
        from: res.from,
        txt: res.txt
    })
    inputType.value = 'number'
    askedInfoType = 'contact_type'
})

socket.on('send_contact_email', (res) => {
    messages.value.push({
        from: res.from,
        txt: res.txt
    })
    inputType.value = 'number'
    askedInfoType = 'contact_type'
})

socket.on('send_contact_number', (res) => {
    messages.value.push({
        from: res.from,
        txt: res.txt
    })
    inputType.value = 'number'
    askedInfoType = 'contact_type'
})
</script>

<template>
    <h2>Chatbot</h2>
<!--  <button-->
<!--      id="startButton"-->
<!--      v-if="!startChatBot"-->
<!--      @click="startChat"-->
<!--  >Chat Bot</button>-->
<!--  <div v-else>-->

    <div class="chat-container" ref="chatContainer" >
        <ul id="messages">
            <li v-for="msg in messages" :key="msg"
                :style="[msg.from === 'server' ? { color: serverTextColor } : { color: 'black' }, msg.from === 'user' ? { textAlign: 'end' } : { textAlign: 'start' }]">
                <pre>{{ `${msg.txt}` }}</pre>
            </li>
        </ul>
        <span class="error" v-if="error">{{ error }}</span>
        <button id="stopButton" @click="stopChat">Arrêter</button>
        <form @submit.prevent="handleChatForm" id="chatForm">
            <input :type="inputType" required v-model="chatText" />
            <button>Envoyer</button>
        </form>
      <button id="close-chat-bot" @click="closeChatBot">Close</button>
    </div>
<!--  </div>-->
</template>
    
<style scoped>
#messages {
    list-style-type: none;
    margin: 0;
    padding: 0;
}

.chat-container {
    border: 2px solid;
    display: flex;
    flex-direction: column;
    max-height: 300px;
    overflow-y: scroll;
}

#chatForm {
    display: flex;
    flex-wrap: wrap;
}

pre {
    white-space: pre-wrap;
}

#chatForm>input {
    max-width: 100%;
    flex: 1;
}

#messages>li {
    padding: 0.5rem 1rem;
}

.error {
    color: red;
    text-align: center;
}

#stopButton, #startButton {
    align-self: end;
    margin-bottom: 2px;
    padding: 0 10px;
}
</style>