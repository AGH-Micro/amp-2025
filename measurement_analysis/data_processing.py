def ReadAndParseData(file_name):
    I_ellipse = []
    Q_ellipse = []
    I_data = []
    Q_data = []
    temp2_data = []
    temp3_data = []

    try:
        with open(file_name, 'r') as file:
            for line in file:
                line = line.strip()
                
                if not line:
                    continue
                
                if line.startswith('=~'):
                    continue
                
                elif line.startswith('ELLIPSE: '):
                    str_value = line[len('ELLIPSE: '):].strip().split(',')
                    try:
                        I = float(str_value[0].strip())
                        Q = float(str_value[1].strip())
                        I_ellipse.append(I)
                        Q_ellipse.append(Q)
                    except (ValueError, IndexError) as e:
                        print("Error parsing IQ ELLIPSE data in line: '{line}'. Error: {e}.")
                        continue
                    
                elif line.startswith('IQ: '):
                    str_value = line[len('IQ: '):].strip().split(',')
                    try:
                        I = float(str_value[0].strip())
                        Q = float(str_value[1].strip())
                        I_data.append(I)
                        Q_data.append(Q)
                    except (ValueError, IndexError) as e:
                        print(f"Error parsing IQ data in line: '{line}'. Error: {e}.")
                        continue
                elif line.startswith('TEMP: '):
                    str_value = line[len('TEMP: '):].strip().split(',')
                    try:
                        temp2 = float(str_value[0].strip())
                        temp3 = float(str_value[1].strip())

                        temp2_data.append(temp2)
                        temp3_data.append(temp3)
                    except (ValueError, IndexError) as e:
                        print(f"Error parsing TEMP data in line: '{line}'. Error: {e}.")
                        continue
                else:
                    print(f"Unknown line format '{line}'")
                    continue
    except FileNotFoundError:
        print(f"Error: File '{file_name}' not found.")
        return None, None, None, None, None, None
    except Exception as e:
        print(f"An unexpected error ocured: {e}.")
        return None, None, None, None, None, None
    
    return I_ellipse, Q_ellipse, I_data, Q_data, temp2_data, temp3_data