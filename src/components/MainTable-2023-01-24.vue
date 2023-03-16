<template>
  <div>

    <div
      v-if="!isAdmin"
      style="padding: 10px 40px; text-align: center; background: #ffdc83"
      @click.prevent="switchToAdmin">
      read only
    </div>

    <h2>ตาราง {{ date }}</h2>
    <div v-for="(row,i) in mTable"
         :class="{gameRow: true, done: row['isPlayed']}"
         style="padding: 2px;">

      <!--First Row-->
      <div style="display: flex">

        <div>
          <div style="font-size: 10px">เกม</div>
          <div style="font-size: 14px; font-family: monospace;">{{ i + 1 }}</div>
        </div>

        <div :class="{playerRow: true}">
          <div v-for="j in [1,2,null,3,4]"
               v-if="j != null"
               :class="{
                 playerCol: true,
                 focusSourcePlayer: focusSourcePlayer.name !== null && i === focusSourcePlayer.rowIndex && row[`player${j}`] === focusSourcePlayer.name,
                 focusPlayer: row[`player${j}`] !== '' && row[`player${j}`] === focusPlayerName,
                 alreadyInQueue: isAlreadyInQueuePlayers(i,row[`player${j}`]),
                 alreadyQuit: row[`player${j}_paid`]
               }">

            <input
              :disabled="!isAdmin"
              v-model="row[`player${j}`]"
              @blur="blurPlayer()"
              @click="setFocusPlayerName(row[`player${j}`])">
            <!--@contextmenu.prevent="contextmenu($event, i, j, row[`player${j}`])"-->

            <span
              v-if="isAdmin"
              @click.prevent="contextmenu($event, i, j, row[`player${j}`])"
              class="option-copy">C</span>

          </div>
          <div v-else style="margin: 2px;">vs</div>
        </div>

      </div>


      <!--Second Row-->
      <div style="display: flex; justify-content: space-between; padding-left: 20px;">
        <div :class="{shuttlecockRow: true}">
          <span
            style="font-size: 18px;"
            :class="{shuttlecockLabelOpenPanel:editShuttlecockRowIndex === i}"
            @click.preven="openShuttlecockSelectionPanel(i)">
            ลูกแบด:
          </span>

          <!--          <div v-if="i === editShuttlecockRowIndex" style="display: inline-block; font-size: 18px;">-->
          <!--            <input-->
          <!--              v-model="editShuttlecockValues"-->
          <!--              ref="ff"-->
          <!--              @blur="blurEditShuttlecock(i)"-->
          <!--              @keyup.enter="blurEditShuttlecock(i)">-->
          <!--          </div>-->
          <!--          <div-->
          <!--            v-else-->
          <!--            v-for="(shuttlecock, j) in row['shuttlecock']"-->
          <!--            @click.prevent="setFocusShuttlecockRowIndex(shuttlecock)"-->
          <!--            @contextmenu.prevent="editShuttlecock(i)"-->
          <!--            :class="{shuttlecockCol: true, focusShuttlecock: shuttlecock === focusShuttlecock}">-->
          <!--            {{ shuttlecock }}-->
          <!--          </div>-->
          <!--          <div v-if="row['shuttlecock'].length === 0 && i !== editShuttlecockRowIndex"-->
          <!--               @click.prevent="editShuttlecock(i)"-->
          <!--               style="display: inline-block"-->
          <!--               :class="{}">-->
          <!--            เพิ่ม-->
          <!--          </div>-->


          <div
            v-for="(shuttlecock, j) in row['shuttlecock']"
            @click.prevent="setFocusShuttlecockRowIndex(shuttlecock)"
            @contextmenu.prevent="removeSelectedShuttlecock(shuttlecock)"
            :class="{shuttlecockCol: true, focusShuttlecock: shuttlecock === focusShuttlecock}">
            {{ shuttlecock }}
          </div>
          <!--          <div-->
          <!--            @click.prevent="openShuttlecockSelectionPanel(i)"-->
          <!--            style="display: inline-block"-->
          <!--            :class="{}">-->
          <!--            เลือก-->
          <!--          </div>-->


        </div>


        <div>

          <span
            v-if="isAdmin"
            @click="moveRowUp(i)"
            style="text-decoration: underline;">up</span>
          <span
            v-if="isAdmin"
            @click="moveRowDown(i)"
            style="text-decoration: underline;">down</span>

          <button
            v-if="!row['isPlayed']"
            :disabled="!isAdmin"
            @click.prevent="toggleIsPlayed(i)"
            style="width: 80px; height: 25px; border-radius: 15px; background: deepskyblue; border: 1px solid #28688f; color:#15405b;">
            รอคิว
          </button>
          <button
            v-else
            :disabled="!isAdmin"
            @click.prevent="toggleIsPlayed(i)"
            style="width: 80px; height: 25px;border-radius: 15px;  background: #ddd; border: 1px solid #aaa; color: #aaa;">
            เล่นแล้ว
          </button>
        </div>

      </div>

      <!--Shuttlecock Selection Panel-->
      <div v-if="i === editShuttlecockRowIndex"
           :class="{shuttlecockSelectionPanel: true}">
        <div
          v-for="shuttlecock in getSelectableShuttlecock(i)"
          @contextmenu.prevent="removeSelectedShuttlecock(shuttlecock.number)"
          style="position: relative">
          <div
            :class="{shuttlecockSelectable: true, used: shuttlecock.used, selected: shuttlecock.selected}"
            @click.prevent="selectShuttlecock(i, shuttlecock.number)">
            {{ shuttlecock.number }}
          </div>
          <span
            v-if="shuttlecock.used && !shuttlecock.selected"
            class="usedLabel">
            ใช้แล้ว
          </span>
        </div>

      </div>

    </div>

    <!--    <button-->
    <!--      v-if="isAdmin && table.length === 0"-->
    <!--      @click.prevent="init"-->
    <!--      style="display: block; width: 100%; font-size: 16px; margin: 10px 0; padding: 5px 0;">-->
    <!--      init-->
    <!--    </button>-->

    <button
      @click.prevent="addGame"
      :disabled="!isAdmin"
      style="display: block; width: 100%; font-size: 16px; margin: 10px 0; padding: 5px 0;">
      เพิ่มเกม
    </button>

    <hr/>

    <h2>สรุปค่าใช้จ่าย {{ date }}</h2>
    <table>
      <tr>
        <th style="min-width: 100px;">ชื่อ</th>
        <th v-for="i in Array(maxShuttlecockUsed + 1).keys()">
          <div>{{ i + 1 }}</div>
          <div>({{ (i + 1) * 20 }})</div>
        </th>
        <th style="border-left: 5px solid black;border-right: 5px solid black; min-width: 100px;">
          ค่าลูก
        </th>
        <th style="min-width: 75px;">ชาย</th>
        <th style="min-width: 75px;">หญิง</th>
        <th style="border-left: 5px solid black;border-right: 5px solid black; min-width: 100px;">รวมทั้งหมด</th>
        <th style="min-width: 125px;">จ่ายแล้ว</th>
        <th style="min-width: 100px;">ชื่อ</th>
      </tr>
      <tr v-for="row in report.rows"
          :class="{paid: row.paid}">
        <td
          :class="{focusPlayer: row.name === focusPlayerName}"
          @click="setFocusPlayerName(row.name)">{{ row.name }}
        </td>
        <td
          v-for="shuttlecock in row.shuttlecock"
          @click.prevent="setFocusShuttlecockRowIndex(shuttlecock)"
          :class="{focusShuttlecock: shuttlecock === focusShuttlecock}"
          style="text-align: center;">
          {{ shuttlecock }}
        </td>
        <td style="border-left: 5px solid black;border-right: 5px solid black;">{{ row.totalShuttlecockUsed }}</td>
        <td @click.prevent="setGender(row.name, 'm')">
          <span v-if="row.gender === 'm' && row.numberShuttlecockUsed === 1" style="color: #1698ee;">30 (1เกม)</span>
          <span v-else-if="row.gender === 'm' && row.numberShuttlecockUsed === 2"
                style="color: #1698ee;">60 (2เกม)</span>
          <span v-else-if="row.gender === 'm'" style="color: #1698ee;">90</span>
        </td>
        <td @click.prevent="setGender(row.name, 'f')">
          <span v-if="row.gender === 'f' && row.numberShuttlecockUsed === 1" style="color: #ec7e9f;">30 (1เกม)</span>
          <span v-else-if="row.gender === 'f' && row.numberShuttlecockUsed === 2"
                style="color: #ec7e9f;">60 (2เกม)</span>
          <span v-else-if="row.gender === 'f'" style="color: #ec7e9f;">80</span>
        </td>
        <td style="border-left: 5px solid black;border-right: 5px solid black;">
          {{ row.total }}
        </td>

        <td v-if="row.paid"
            @click.prevent="pay(row.name, false)"
            style="min-width: 100px;">
          จ่ายแล้ว
          <span v-if="row.total !== row.actualPaid">({{ row.actualPaid }})</span>
        </td>
        <td v-else
            style="min-width: 100px;">
          <button
            :disabled="!isAdmin"
            @click.prevent="pay(row.name, true, row.total)"
            style="width: 100%;">
            จ่าย
          </button>
        </td>
        <td
          :class="{focusPlayer: row.name === focusPlayerName}"
          @click="setFocusPlayerName(row.name)">{{ row.name }}
        </td>

      </tr>
      <tr style="border-top: 5px solid black;">
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td v-for="i in Array(maxShuttlecockUsed + 1).keys()"></td>
        <td>{{ report.sumTotal }}</td>
        <td>{{ report.sumTotalActual }}</td>
      </tr>
    </table>

  </div>
</template>

<script>

// import {
//   Popover,
//   Input,
//   Button,
//   Table,
// } from 'element-ui'

import {db} from '../firebase'

const PASSWORD = 'noname49'

function checkPassword(inputPassword) {
  if (typeof inputPassword !== 'string') return false
  return inputPassword.toLowerCase().trim() === PASSWORD
}


const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
})

let isAdmin = false
let currentDate = params['date']

function setWithExpiry(key, value, ttl) {
  const now = new Date()

  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  }
  localStorage.setItem(key, JSON.stringify(item))
}

function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key)
  // if the item doesn't exist, return null
  if (!itemStr) {
    return null
  }
  const item = JSON.parse(itemStr)
  const now = new Date()
  // compare the expiry time of the item with the current time
  if (now.getTime() > item.expiry) {
    // If the item is expired, delete the item from storage
    // and return null
    localStorage.removeItem(key)
    return null
  }
  return item.value
}

function ymd(date) {
  let dd = date
  dd.setHours(dd.getHours() - 6)
  const y = dd.getFullYear()
  const m = dd.getMonth() + 1
  const d = dd.getDate()
  return `${y}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d}`
}

function setIAmAdmin() {
  isAdmin = true
  const ttl = 6 * 60 * 60 * 1000 // 6 hours
  setWithExpiry('isAdmin', isAdmin, ttl)
}

if (getWithExpiry('isAdmin') === true) {
  isAdmin = true
} else if (checkPassword(params['admin'])) {
  setIAmAdmin()
}


if (!currentDate) {
  currentDate = ymd(new Date())
}

console.log({date: currentDate})

//
// const dd = new Date('2023-01-01')
// for (let m = 1; m <= 12; m++) {
//   for (let d = 1; d <= 31; d++) {
//     function pad(x) {
//       return x < 10 ? '0' + x : `${x}`
//     }
//
//     db.collection('db')
//       .doc(`2023-${pad(m)}-${pad(d)}`)
//       .set({
//         table: [],
//         players: [],
//       })
//   }
// }

function getTableStructure() {
  return {
    isPlayed: false,
    player1: '',
    player2: '',
    player3: '',
    player4: '',
    shuttlecock: [],
  }
}

function getPlayerStructure() {
  return {name: 'test', gender: 'm', paid: false, amount: 0}
}

export default {
  name: 'app',
  created() {
    db.collection('db')
      .doc(currentDate)
      .onSnapshot(snapshot => {
        // if (!snapshot.exists) {
        //   db.collection('db')
        //     .doc(currentDate)
        //     .set({
        //       table: [],
        //       players: [],
        //     })
        // }
        this.snapshot = snapshot.data()
        if (snapshot.data()) {
          this.table = [...snapshot.data().table]
          this.players = [...snapshot.data().players]
        }

        console.log({
          table: this.table,
          players: this.players,
        })
      })
  },
  data() {
    return {
      isAdmin: isAdmin,
      date: currentDate,
      snapshot: {},
      focusPlayerName: null,
      focusSourcePlayer: {rowIndex: null, name: null},
      focusShuttlecock: null,
      editShuttlecockRowIndex: null,
      editShuttlecockValues: '',
      table: [],
      players: [
        getPlayerStructure(),
      ],
      maxShuttlecockUsed: 0,
    }
  },
  methods: {
    init() {
      // if (!this.isAdmin) return
      // db.collection('db')
      //   .doc(currentDate)
      //   .set({
      //     table: [],
      //     players: [],
      //   }).then(() => {
      //   this.addGame()
      // })
    },
    sync() {

      if (!this.isAdmin) return
      if (this.table.length === 0) return

      db.collection('db')
        .doc(currentDate)
        .update({
          ...this.snapshot,
          table: this.table,
          players: this.players,
        }).catch(console.log)
    },
    switchToAdmin() {
      if (checkPassword(prompt('Password'))) {
        this.isAdmin = true
        setIAmAdmin()
      }
    },
    addGame() {
      this.table.push(getTableStructure())
    },
    blurPlayer() {
      this.sync()
    },
    toggleIsPlayed(rowIndex) {
      this.table[rowIndex]['isPlayed'] = !this.table[rowIndex]['isPlayed']
      this.table = [...this.table]
      this.sync()
    },
    setFocusPlayerName(name) {
      if (this.focusPlayerName === name) {
        this.focusPlayerName = null
      } else {
        this.focusPlayerName = name
      }
    },
    setFocusShuttlecockRowIndex(number) {
      if (this.focusShuttlecock === number) {
        this.focusShuttlecock = null
      } else {
        this.focusShuttlecock = number
      }
    },

    openShuttlecockSelectionPanel(rowIndex) {

      if (!this.isAdmin) return

      if (this.editShuttlecockRowIndex === rowIndex) {
        this.editShuttlecockRowIndex = null
        return
      }
      this.focusShuttlecock = null
      this.editShuttlecockRowIndex = rowIndex
    },
    selectShuttlecock(rowIndex, shuttlecock) {
      if (this.table[rowIndex].shuttlecock.includes(shuttlecock)) {
        this.table[rowIndex].shuttlecock = this.table[rowIndex].shuttlecock
          .filter(number => number !== shuttlecock)
      } else {
        const shuttlecocks = [...new Set([...this.table[rowIndex].shuttlecock, shuttlecock])]
        shuttlecocks.sort((a, b) => a - b)
        this.table[rowIndex].shuttlecock = shuttlecocks
      }

      this.editShuttlecockRowIndex = null
      this.sync()
    },
    removeSelectedShuttlecock(rowIndex, shuttlecock) {
      if (confirm(`ต้องการลบลูกแบดหมายเลข ${shuttlecock} ออก ?`)) {
        this.table[rowIndex].shuttlecock = this.table[rowIndex].shuttlecock.filter(n => n !== shuttlecock)
      }
    },
    getSelectableShuttlecock(rowIndex) {

      let maxNumber = 0
      for (const row of this.table) {
        try {
          maxNumber = Math.max(
            maxNumber,
            row.shuttlecock.reduce((x, y) => Math.max(x, y))
          )
        } catch (e) {
        }
      }

      maxNumber += 5
      maxNumber = Math.ceil(maxNumber / 5) * 5

      const used = this.table
        //.filter(row => row['isPlayed'])
        .map(row => row['shuttlecock'])
        .flat()

      const selected = this.table[rowIndex].shuttlecock

      const shuttlecocks = []
      for (let i = 1; i <= maxNumber; i++) {
        shuttlecocks.push({
          number: i,
          used: used.includes(i),
          selected: selected.includes(i),
        })
      }

      console.log('R', rowIndex, {shuttlecocks, used, selected})
      return shuttlecocks
    },

    // editShuttlecock(rowIndex) {
    //   this.focusShuttlecock = null
    //   this.editShuttlecockRowIndex = rowIndex
    //   this.editShuttlecockValues = this.table[rowIndex]['shuttlecock'].join(' ')
    //   // this.$nextTick(() => {
    //   //   console.log('this.$refs.ff', this.$refs.ff)
    //   //   console.log('this.$refs.ff.$el', this.$refs.ff.$el)
    //   //   console.log('this.$refs.ff.input', this.$refs.ff.input)
    //   //   setTimeout(() =>
    //   //       this.$refs.ff.input.focus()
    //   //     , 400)
    //   // })
    // },
    // blurEditShuttlecock(rowIndex) {
    //   const numbers = this.editShuttlecockValues
    //     .split(' ')
    //     .map(number => parseInt(number) || 0)
    //     .filter(number => number > 0)
    //   numbers.sort((a, b) => a - b)
    //   console.log({numbers})
    //   this.editShuttlecockRowIndex = null
    //   this.table[rowIndex].shuttlecock = numbers
    //   this.sync()
    // },

    contextmenu(e, rowIndex, playerIndex, name) {
      this.focusPlayerName = null
      if (this.focusSourcePlayer.rowIndex === null) {
        if (name.trim() === '') return
        this.focusSourcePlayer = {rowIndex, name}
      } else {
        this.table[rowIndex][`player${playerIndex}`] = this.focusSourcePlayer.name
        this.table = [...this.table]
        this.focusSourcePlayer = {rowIndex: null, name: null}
        this.sync()
      }
    },
    isAlreadyInQueuePlayers(rowIndex, name) {
      for (let i = rowIndex + 1; i < this.table.length; i++) {
        const row = this.table[i]
        const players = [row['player1'], row['player2'], row['player3'], row['player4']]
        if (players.includes(name)) return true
      }
      return false
    },
    moveRowUp(rowIndex) {
      if (rowIndex === 0) return
      const up = this.table[rowIndex - 1]
      const current = this.table[rowIndex]

      this.table[rowIndex - 1] = current
      this.table[rowIndex] = up

      this.table = [...this.table]
      this.sync()
    },
    moveRowDown(rowIndex) {
      if (rowIndex >= this.table.length - 1) return
      const current = this.table[rowIndex]
      const down = this.table[rowIndex + 1]

      this.table[rowIndex] = down
      this.table[rowIndex + 1] = current

      this.table = [...this.table]
      this.sync()
    },
    setGender(name, gender) {
      const matches = this.players.filter(player => player.name === name)
      let player
      if (matches.length === 0) {
        this.players.push(player = {
          ...getPlayerStructure(),
          name,
          gender,
        })
      } else {
        player = matches[0]
        player.gender = gender
      }
      this.players = [...this.players]
      this.table = [...this.table]
      this.sync()
    },
    pay(name, paid, amount = 0) {

      if (paid) {
        amount = parseInt(prompt('จำนวนเงินที่จ่ายจริง', amount))
        if (isNaN(amount)) return
      }

      const matches = this.players.filter(player => player.name === name)
      let player
      if (matches.length === 0) {
        this.players.push(player = {
          ...getPlayerStructure(),
          name,
          paid,
          amount
        })
      } else {
        player = matches[0]
        player.paid = paid
        player.amount = amount
      }
      this.players = [...this.players]
      this.sync()
    },
  },
  computed: {
    mTable() {
      const paidList = {}
      for (const player of this.players) {
        paidList[player.name] = player.paid
      }

      const r = this.table.map(row => {
        return {
          ...row,
          player1_paid: paidList[row.player1] === true,
          player2_paid: paidList[row.player2] === true,
          player3_paid: paidList[row.player3] === true,
          player4_paid: paidList[row.player4] === true,
        }
      })

      return r
    },
    report() {

      const shuttlecockUsed = {}
      const actualPaid = {}

      let maxShuttlecockUsed = 5
      for (const row of this.table) {
        // if (!row['isPlayed']) continue
        const players = [row['player1'], row['player2'], row['player3'], row['player4']]
          .map(name => name.trim())
          .filter(name => name.length > 0)
        const shuttlecocks = row.shuttlecock
        for (const player of players) {
          if (typeof shuttlecockUsed[player] === "undefined") {
            shuttlecockUsed[player] = []
          }
          console.log('player', player, player.amount)
          shuttlecockUsed[player].push(...shuttlecocks)
          maxShuttlecockUsed = Math.max(maxShuttlecockUsed, shuttlecockUsed[player].length)
        }
      }

      for (const player of this.players) {
        actualPaid[player.name] = player.amount
      }

      const rows = []
      let sumTotal = 0
      let sumTotalActual = 0

      for (const [playerName, shuttlecocks] of Object.entries(shuttlecockUsed)) {
        const gender = this.players.filter(p => p.name === playerName && p.gender === 'f').length > 0 ? 'f' : 'm'
        const isPaid = this.players.filter(p => p.name === playerName && p.paid).length > 0
        let total = 0
        if (shuttlecocks.length === 1) {
          total = 30
        } else if (shuttlecocks.length === 2) {
          total = 60
        } else {
          total = (gender === 'm' ? 90 : 80)
        }
        total += shuttlecocks.length * 20

        sumTotal += total

        if (!isNaN(actualPaid[playerName])) {
          sumTotalActual += actualPaid[playerName]
        }

        rows.push({
          name: playerName,
          shuttlecock: Array.from({...shuttlecocks, length: maxShuttlecockUsed + 1}),
          numberShuttlecockUsed: shuttlecocks.length,
          totalShuttlecockUsed: shuttlecocks.length * 20,
          gender: gender,
          total,
          paid: isPaid,
          actualPaid: actualPaid[playerName]
        })
      }

      this.maxShuttlecockUsed = maxShuttlecockUsed

      const report = {
        rows,
        sumTotal,
        sumTotalActual,
      }

      console.log({report})

      return report
    },
  },
}
</script>
<style scoped>
body {
  padding: 0;
  margin: 0;
}

.gameRow {
  /*display: flex;*/
  margin-bottom: 5px;
}

.gameRow .playerRow {
  display: flex;
  overflow: hidden;
}

.gameRow .playerCol {
  display: flex;
  border: 2px solid white;
  background: #c3e88d;
  width: 25%;
}

.gameRow .playerCol .option-copy {
  width: 25px;
  height: 25px;
  background: #7cbd57;
  border-radius: 25px;
  text-align: center;
  margin: 2px;
}

.gameRow.done .playerCol {
  background: #eeeeee;
}

.gameRow.done .playerCol .option-copy {
  background: #cad0ca;
}

.gameRow .playerCol input {
  display: inline-block;
  border: none;
  background: none;
  width: 85%;
  height: 85%;
  /*margin-right: 25%;*/
  font-size: 18px;
}

.gameRow.done .playerCol input {
  color: #666;
}

.playerCol.alreadyInQueue input {
  text-decoration: line-through;
}

.playerCol.alreadyQuit input {
  text-decoration: line-through;
  text-decoration-style: double;
}


.gameRow .shuttlecockRow {
  min-width: 40px;
  margin-top: 2px;
}

.gameRow .shuttlecockRow .shuttlecockCol {
  display: inline-block;
  font-family: monospace;
  width: 20px;
  height: 20px;
  border-radius: 12px;
  text-align: center;
  margin: 2px;
  padding: 2px;
  background: #94c868;
}

.gameRow.done .shuttlecockRow .shuttlecockCol {
  color: #bbbbbb;
  background: #dadada;
}

table {
  border-collapse: collapse;
}

table th, table td {
  padding: 5px;
  border: 1px solid #2c3e50;
}

table tr.paid, table tr.paid span {
  color: #bbbbbb !important;
}

table tr.paid, table tr.paid td {
  color: #bbbbbb !important;
  background: #eee;
}

.focusPlayer {
  background: #f8b561 !important;
}

.focusPlayer input {
  color: black !important;
}

.focusSourcePlayer {
  border: 2px solid #f33207 !important;
}

.focusShuttlecock {
  background: #f8b561 !important;
}

.shuttlecockSelectionPanel {
  margin-left: 20px;
  padding: 5px;
  display: flex;
  flex-wrap: wrap;
  border: 2px solid #aaa;
}

.shuttlecockLabelOpenPanel {
  font-size: 18px;
  border: 2px solid #aaa;
  padding: 2px 5px 0;
  top: 5px;
  position: relative;
  border-bottom: none;
  background: #FFF;
}

.shuttlecockSelectionPanel > div {
  /*flex-grow: 1;*/
  width: 20%;
}

.shuttlecockSelectable {
  display: inline-block;
  text-align: center;
  padding-top: 3px;
  margin-bottom: 8px;
  width: 30px;
  height: 27px;
  border-radius: 20px;
  color: #000000;
  font-weight: bold;
  border: 2px solid #000000;
  background: #eee;
}

.shuttlecockSelectable.used {
  color: #ddd;
  border: 2px solid #ddd;
  background: #eee;
}

.shuttlecockSelectable.selected {
  color: #000000;
  border: 2px solid #000;
  background: #94c868;
}

.usedLabel {
  position: absolute;
  left: 0px;
  top: 22px;
  font-size: 10px;
  background: #ddd;
  color: #FFF;
  padding: 1px 4px;
  border-radius: 8px;
}
</style>
