import { Relative, Gender } from '../utils/inheritanceLogic';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
    Home: undefined;
    MirathInput: undefined;
    MirathResult: {
        deceasedGender: Gender;
        relatives: Relative[];
        totalWealth: number;
    };
    Zakaat: undefined;
};

export type Props = NativeStackScreenProps<RootStackParamList>;
