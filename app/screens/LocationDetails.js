import React, { Component } from 'react';
import { connect } from 'react-redux'; 
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HeaderBackButton } from 'react-navigation';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Button, ButtonGroup, ListItem } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { retrieveItem } from '../config/utils';
import { putData } from '../config/request'

import { getData } from '../config/request'

class LocationDetails extends Component {
    constructor(props) {
        super(props)
        this.state = {
            id: this.props.navigation.state.params['id'] ? this.props.navigation.state.params['id'] : this.props.query.locationId,
            locationDetailsLoading: true,
            buttonIndex: 0,
            location: {},
        }
    }

    static navigationOptions = ({ navigation }) => {
        return {
          headerLeft: <HeaderBackButton onPress={() => navigation.goBack(null)} />,
          title: <Text>{navigation.getParam('locationName')}</Text>,
        };
      };

    updateIndex = buttonIndex => {
        this.setState({ buttonIndex })
    }

    getTitle = machine => (
        <Text>
            <Text style={s.machineName}>{machine.name}</Text>
            {machine.year && <Text style={[s.machineMeta,s.italic]}>{` (${machine.manufacturer && machine.manufacturer + ", "}${machine.year})`}</Text>}
        </Text>
    )
            
    componentDidMount() {
        getData(`/locations/${this.state.id}.json`)
        .then(data => {
            this.setState({
                locationDetailsLoading: false,
                location: data,
            })
        })
        
        retrieveItem('auth').then((auth) => {
            console.log(auth)
            this.setState({ auth })
        }).catch((error) => console.log('Promise is rejected with error: ' + error)); 
    }

    render() {
        if (this.state.locationDetailsLoading) {
            return (
                <View style={{ flex: 1, padding: 20 }}>
                    <ActivityIndicator />
                </View>
            )
        }

        const location = this.state.location
   
        return (
            <View style={{ flex: 1 }}>
                <MapView
                    region={{
                        latitude: Number(location.lat),
                        longitude: Number(location.lon),
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.03
                    }}
                    style={s.map}
                    provider={PROVIDER_GOOGLE}
                >
                    <MapView.Marker
                        coordinate={{
                            latitude: Number(location.lat),
                            longitude: Number(location.lon),
                            latitudeDelta: 0.03,
                            longitudeDelta: 0.03,
                        }}
                    />
                </MapView>
                <View style={{ flex: 3 }}>
                    <ButtonGroup
                        onPress={this.updateIndex}
                        selectedIndex={this.state.buttonIndex}
                        buttons={['Machines', 'Info']}
                        containerStyle={{ height: 30 }}
                        selectedButtonStyle={s.buttonStyle}
                        selectedTextStyle={s.textStyle}
                    />
                    {this.state.buttonIndex === 0 ?
                        <ScrollView>
                            {location.date_last_updated && <Text style={s.lastUpdated}>Last Updated: {location.date_last_updated}{location.last_updated_by_user_id  && ` by` } <Text style={s.textStyle}>{`${location.last_updated_by_username}`}</Text></Text>}
                            {this.state.auth && 
                                <View>
                                    <Button
                                        onPress={() => this.props.navigation.navigate('AddMachine')}
                                        title={'Add Machine'}
                                        accessibilityLabel="Add Machine"
                                        raised
                                        rounded
                                        buttonStyle={s.addButton}
                                        titleStyle={{
                                            color:"black", 
                                            fontSize:18
                                        }}
                                        style={{paddingLeft: 10,paddingRight: 10,paddingTop: 5, paddingBottom: 5}}
                                    />
                                    <Button
                                        onPress={() =>  {
                                            const body = {
                                                user_email: this.state.auth.email,
                                                user_token: this.state.auth.authentication_token,
                                            }
                                            putData(`/locations/${location.id}/confirm.json`, body)
                                                .then(data => console.log(data))
                                                .catch(err => console.log(err))
                                        }}
                                        title={'Confirm machine list is up to date'}
                                        accessibilityLabel="Confirm machine list is up to date"
                                        raised
                                        rounded
                                        buttonStyle={s.confirmButton}
                                        titleStyle={{
                                            color:"#888888",
                                            fontSize:18
                                        }}
                                        style={{paddingLeft: 10,paddingRight: 10,paddingTop: 5, paddingBottom: 5}}
                                    />
                                </View>
                            }
                            {location.location_machine_xrefs.map(machine => {
                                const m = this.props.machines.machines.find(m => m.id === machine.machine_id)
    
                                if (m) 
                                    return (
                                        <TouchableOpacity  key={machine.machine_id} onPress={() => this.props.navigation.navigate('MachineDetails')}>
                                            <ListItem
                                                title={this.getTitle(m)}
                                                subtitle={
                                                    <View style={s.condition}>
                                                        {machine.condition && <Text style={s.conditionText}>{machine.condition.length < 200 ? machine.condition : `${machine.condition.substr(0, 200)}...`}</Text>}
                                                        {machine.condition_date && <Text>{`Last Updated: ${machine.condition_date} ${machine.last_updated_by_username && `by: ${machine.last_updated_by_username}`}`}</Text>}
                                                    </View>
                                                }
                                                rightElement = {<Ionicons style={s.iconStyle} name="ios-arrow-dropright" />}
                                            />
                                            <View
                                                style={{
                                                    borderBottomColor: '#D3ECFF',
                                                    borderBottomWidth: 1,
                                                }}
                                            />
                                        </TouchableOpacity>
                                    )
                            })}
                        </ScrollView> :
                        <View style={s.locationMeta}>
                            <Text style={[s.street,s.font18]}>{location.street}</Text>
                            <Text style={[s.city,s.font18,s.marginB8]}>{location.city}, {location.state} {location.zip}</Text>
                            
                            {location.phone && <Text style={[s.phone,s.font18,s.marginB8]} 
                                onPress={() => Linking.openURL(location.phone)}>
                                {location.phone}</Text>}

                            {location.website && <Text style={[s.website,s.font18,s.marginB8]}
                                onPress={() => Linking.openURL(location.website)}
                                >Website</Text>}
                            
                            {location.location_type_id && <Text style={[s.type,s.italic,s.font18,s.marginB8]}>
                                {this.props.locations.locationTypes.find(type => type.id === location.location_type_id).name}
                                </Text>}

                            {location.operator_id && <Text style={[s.operator,s.italic,s.marginB8]}>Operated by: 
                                {location.operator_id && <Text style={[s.operator,s.notItalic]}>
                                {` ${this.props.operators.operators.find(operator => operator.id === location.operator_id).name}`}
                                </Text>}</Text>}

                            {location.description && <Text style={[s.description,s.italic]}>
                                Location Description: <Text style={[s.description,s.notItalic]}>{location.description}</Text></Text>}                                   

                        </View>
                    }
                </View>
            </View>
        )
    }
}

const s = StyleSheet.create({
    map: {
        flex: 1,
    },
    buttonStyle: {
        backgroundColor: '#D3ECFF',
    },
    textStyle: {
        color: '#000000',
        fontWeight: 'bold',
    },
    machineName: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 18
    },
    machineMeta: {
        fontSize: 16
    },
    locationMeta: {
        marginLeft: 10 
    },
    font18: {
        fontSize: 18
    },
    marginB8: {
        marginBottom: 8
    },
    street: {
        fontWeight: 'bold'
    },
    phone: {
        textDecorationLine: 'underline'
    },
    website: {
        textDecorationLine: 'underline'
    },
    italic: {
        fontStyle: 'italic',
        color: '#444444'
    },
    notItalic: {
        fontStyle: 'normal'
    },
    operator: {
        fontSize: 16,
        color: '#666666'
    },
    description: {
        fontSize: 16,
        color: '#666666'
    },
    iconStyle: {
        fontSize: 32,
        color: '#cccccc',
    },
    addButton: {
        backgroundColor:"#D3ECFF",
        borderRadius: 50,
        width: '100%'
    },
    confirmButton: {
        backgroundColor:"#dddddd",
        borderRadius: 50,
        width: '100%'
    },
    condition: {
        marginTop: 10
    },
    conditionText: {
        color: '#888888',
        fontSize: 14,
    },
    lastUpdated: {
        textAlign: 'center',
    }
});

const mapStateToProps = ({ locations, operators, machines, query }) => ({ locations, operators, machines, query })
export default connect(mapStateToProps)(LocationDetails);
