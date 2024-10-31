import { useState } from 'react'
import { View, Text, Keyboard, TextInput, Pressable, Button } from 'react-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import styles from '../style/style'
import Header from './Header'
import { NBR_OF_DICES, NBR_OF_THROWS, MIN_SPOT, MAX_SPOT, BONUS_POINTS, BONUS_POINTS_LIMIT } from '../constants/Game'
import Footer from './Footer'

export default Home = ({navigation}) => {

    const [playername, setPlayerName] = useState('')
    const [hasPlayerName, setHasPlayerName] = useState(false)

    const handlePlayerName = (value) => {
        if (value.trim().length > 0) {
            setHasPlayerName(true)
            Keyboard.dismiss()
        }
    }

    return (
        <>
            <Header />
            <View style={styles.container}>
                <MaterialCommunityIcons name='information' size={90} color='steelblue' />
                {!hasPlayerName ?
                    <>
                        <Text>For scoreboard enter your name... </Text>
                        <TextInput onChangeText={setPlayerName} autoFocus={true} style={styles.textInput} />
                        <Pressable  style={styles.button}>
                            <Button title='OK' onPress={() => handlePlayerName(playername)}/>
                        </Pressable>
                    </>
                    :
                    <>
                    <View style={styles.gameinfo}>
                        <Text> Rules of the game</Text>
                        <Text multiline='true'>
                            THE GAME: Upper section of the classic Yahtzee
                            dice game. You have {NBR_OF_DICES} dices and
                            for the every dice you have {NBR_OF_THROWS}
                            throws. After each throw you can keep dices in
                            order to get same dice spot counts as many as
                            possible. In the end of the turn you must select
                            your points from {MIN_SPOT} to {MAX_SPOT}.
                            Game ends when all points have been selected.
                            The order for selecting those is free.
                        </Text>
                        <Text>Good luck, {playername}</Text>
                        <Pressable  style={styles.button}>
                            <Button title='Play'onPress={()=> navigation.navigate('Gameboard', {player: playername})} />
                        </Pressable>
                    </View>
                    </>
                }
            </View>
            <Footer />
        </>
    )
}