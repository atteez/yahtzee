import { useState, useEffect } from 'react'
import { View, Text, Pressable, Button } from 'react-native'
import { NBR_OF_DICES, NBR_OF_THROWS, MIN_SPOT, MAX_SPOT, BONUS_POINTS, BONUS_POINTS_LIMIT, SCOREBOARD_KEY } from '../constants/Game'
import styles from '../style/style'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Container, Row, Col } from 'react-native-flex-grid'
import Header from './Header'
import Footer from './Footer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import style from '../style/style'


let board = []

export default Gameboard = ({ navigation, route }) => {

    const [playerName, setPlayerName] = useState('')
    const [nbrOfThrowsLeft, setNbrOfThrowsLeft] = useState(NBR_OF_THROWS)
    const [round, setRound] = useState(1)
    const [status, setStatus] = useState('Throw dices')
    const [gameEndStatus, setGameEndStatus] = useState('')
    // Mitkä arpakuutiot valittu
    const [selectedDices, setSelectedDices] = useState(new Array(NBR_OF_DICES).fill(false))
    // Arpakuutioiden silmäluvut
    const [diceSpots, setDiceSpots] = useState(new Array(NBR_OF_DICES).fill(0))
    // Mitkä arpakuutioiden silmäluvuista on valittu pisteisiin
    const [selectedDicePoints, setSelectedDicePoints] = useState(new Array(MAX_SPOT).fill(0))
    //valittujen arpakuutioiden kokonaispistemäärät
    const [dicePointsTotal, setDicePointsTotal] = useState(new Array(MAX_SPOT).fill(0))
    const [scores, setScores] = useState([])



    useEffect(() => {
        if (playerName === '' && route.params?.player) {
            setPlayerName(route.params.player)
        }
    }, [])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getScoreboardData()
        })
    }, [navigation])


    const getScoreboardData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY)
            if (jsonValue !== null) {
                const tmpScores = JSON.parse(jsonValue)
                setScores(tmpScores)
            }
        }

        catch (e) {
            console.log('Read error' + e)
        }
    }

    const savePlayerPoints = async () => {
        const newKey = scores.length + 1
        const playerPoints = {
            key: newKey,
            name: playerName,
            date: 'date',
            time: 'time',
            points: 0
        }
        try {
            const newScore = [...scores, playerPoints]
            const jsonValue = JSON.stringify(newScore)
            await AsyncStorage.setItem(SCOREBOARD_KEY, jsonValue)

        }
        catch (e) {
            console.log('Gamboard: save error' + e)

        }
    }

    const calculateTotalPoints = () => {
        const totalPoints = dicePointsTotal.reduce((a, b) => a + b, 0)
        return totalPoints >= BONUS_POINTS_LIMIT ? totalPoints + BONUS_POINTS : totalPoints
    }

    const dicesRow = [];
    for (let dice = 0; dice < NBR_OF_DICES; dice++) {
        dicesRow.push(
            <Col key={'dice' + dice}>
                <Pressable
                    key={"row" + dice}
                    onPress={() => chooseDice(dice)}>
                    <MaterialCommunityIcons
                        name={board[dice]}
                        key={"row" + dice}
                        size={50}
                        color={getDiceColor(dice)}>
                    </MaterialCommunityIcons>
                </Pressable>
            </Col>
        );
    }

    const pointsRow = []
    for (let spot = 0; spot < MAX_SPOT; spot++) {
        pointsRow.push(
            <Col key={'points' + spot}>
                <Text key={'points' + spot}>{getSpotTotal(spot)}</Text>
            </Col>
        )
    }

    const pointsToSelectRow = []
    for (let diceButton = 0; diceButton < MAX_SPOT; diceButton++) {
        pointsToSelectRow.push(
            <Col key={'buttonsRow' + diceButton}>
                <Pressable key={'buttonsRow' + diceButton} onPress={() => chooseDicePoints(diceButton)}>
                    <MaterialCommunityIcons
                        name={'numeric-' + (diceButton + 1) + '-circle'}
                        key={'buttonRow' + diceButton}
                        size={35}
                        color={getDicePointsColor(diceButton)}>
                    </MaterialCommunityIcons>
                </Pressable>
            </Col>
        )
    }


    const chooseDice = (i) => {
        if (nbrOfThrowsLeft < NBR_OF_THROWS && !gameEndStatus) {
            let dices = [...selectedDices]
            dices[i] = selectedDices[i] ? false : true
            setSelectedDices(dices)
        }
        else {
            setStatus('You have to throw dices first')
        }
    }

    const chooseDicePoints = (i) => {
        if (nbrOfThrowsLeft === 0) {
            let selectedPoints = [...selectedDicePoints]
            let points = [...dicePointsTotal]
            if (!selectedPoints[i]) {
                selectedPoints[i] = true
                let nbrOfDices = diceSpots.reduce((total, x) => (x === (i + 1) ? total + 1 : total), 0)
                points[i] = nbrOfDices * (i + 1)
            }
            else {
                setStatus('You already selected points for ' + (i + 1))
                return points[i]
            }
            setDicePointsTotal(points)
            setSelectedDicePoints(selectedPoints)
            return points[i]
        }
        else {
            setStatus('Throw ' + NBR_OF_THROWS + 'times before setting points.')
        }
    }

    function getDiceColor(i) {
        return selectedDices[i] ? "black" : "steelblue"
    }


    function getDicePointsColor(i) {
        return (selectedDicePoints[i] && !gameEndStatus) ? "black" : "steelblue"
    }

    function getSpotTotal(i) {
        return dicePointsTotal[i]
    }

    const throwDices = () => {
        if (nbrOfThrowsLeft === 0) {
            if (round < 6) {
                setNbrOfThrowsLeft(NBR_OF_THROWS)
                setRound(round + 1)
                setSelectedDices(new Array(NBR_OF_DICES).fill(false))
            } else {
                setGameEndStatus('Game over!')
                savePlayerPoints()
                setStatus(`Game over! Final score: ${calculateTotalPoints()}`)
            }
        } else {
            let spots = [...diceSpots]
            for (let i = 0; i < NBR_OF_DICES; i++) {
                if (!selectedDices[i]) {
                    let randomNumber = Math.floor(Math.random() * 6 + 1)
                    board[i] = 'dice-' + randomNumber
                    spots[i] = randomNumber
                }
            }
            setNbrOfThrowsLeft(nbrOfThrowsLeft - 1)
            setDiceSpots(spots)
            setStatus('Select and throw dices again')
        }
    }
    const restartGame = () => {
        setNbrOfThrowsLeft(NBR_OF_THROWS)
        setRound(1)
        setSelectedDices(new Array(NBR_OF_DICES).fill(false))
        setDiceSpots(new Array(NBR_OF_DICES).fill(0))
        setSelectedDicePoints(new Array(MAX_SPOT).fill(0))
        setDicePointsTotal(new Array(MAX_SPOT).fill(0))
        setStatus('Throw dices')
        setGameEndStatus('')
    }

    return (
        <>
            <Header />
            <View style={styles.gameboard}>
                <Container>
                    <Row>{dicesRow}</Row>
                </Container>
                <Text style={styles.text}>Throws left: {nbrOfThrowsLeft}</Text>
                <Text style={styles.text}>{status}</Text>
                <Pressable style={styles.button}>
                    <Button title='throw dices' onPress={() => throwDices()} />
                </Pressable>
                <Container>
                    <Row>{pointsRow}</Row>
                </Container>
                <Container>
                    <Row>{pointsToSelectRow}</Row>
                </Container>
                <Text style={styles.text}>Player: {playerName} </Text>
                <Pressable style={styles.button}>
                    <Button title='Save points' onPress={() => savePlayerPoints} />
                </Pressable>
                {gameEndStatus && (
                    <Pressable style={styles.button}>
                        <Button title='Restart Game' onPress={() => restartGame()} />
                    </Pressable>
                )}
            </View>
            <Footer />
        </>
    )
}