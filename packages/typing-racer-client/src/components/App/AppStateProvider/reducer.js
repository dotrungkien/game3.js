export default function (state, { type, payload }) {
  switch (type) {
    case 'UPDATE_ROOM':
      return {
        ...state,
        room: payload,
      };
    case 'UPDATE_NETWORK':
      return {
        ...state,
        network: payload,
      };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        account: payload,
      };
    case 'UPDATE_BALANCE':
      return {
        ...state,
        balance: payload,
      };

    case 'UPDATE_CLIENT_ID':
      return {
        ...state,
        clientId: payload,
      };
    case 'UPDATE_PLAYERS':
      return {
        ...state,
        players: payload,
      };

    case 'UPDATE_TERMINAL':
      return {
        ...state,
        teminal: payload,
      };
    case 'ADD_PLAYER':
      state.players.push(payload);
      return state;
    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(player => player.id !== payload),
      };
    case 'RESET_PLAYERS':
      return {
        ...state,

        players: [],
      };
    case 'UPDATE_SENTENCE':
      return {
        ...state,
        sentence: payload,
      };
    case 'UPDATE_CURRENT_INDEX':
      return {
        ...state,
        currentIndex: payload,
      };
    case 'WRONG_LETTER':
      return {
        ...state,
        wrongLetter: payload,
      };
    default:
      return state;
  }
}
