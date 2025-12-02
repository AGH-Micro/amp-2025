clear; clc;  close all;

%wartości sygnału
x=[]; y=[];
%segmenty każdej elipsy, elips jest kilka więc zapiszemy każdą osobno
X={}; Y={};

theta_tab={}; %komórki do zbierania thety
theta_buf=[];
start_index=1; 

tc={}; % komórki do zbierania t
t_buf = [];

i=1;

for t=0.1:0.01:20
    %generowanie sygnału
    [I,Q]=generator(t);
    x(end+1)=I;
    y(end+1)=Q;

    %liczenie fazy
    theta=atan2(Q,I);
    theta_buf(end+1)=atan2(Q,I);
    t_buf(end+1) = t;

    %sprawdzenie czy był pełny obrót elipsy
    %repeat zwraca false lub true
    [repeat,loops]=check(t,theta);
   
    if repeat
        X{end+1}=x(start_index:end); %zbieranie danych I jednej elipsy
        Y{end+1}=y(start_index:end); %zbieranie danych Q jednej elipsy
        

        tc{i} = t_buf; % zbieranie t z jednej elipsy
        theta_tab{i}=unwrap(theta_buf); % zbieranie fazy z jednej elipsy i od razu unrwapping

        start_index = length(x)+1;        
        theta_buf=[]; % wyczyść bufor
        t_buf = []; % wyczyść bufor

        i=i+1;
        
    end

end

% odczytanie współczynników i fazy całej elipsy

[coeff,Ox,Oy,phi]=coeff(X,Y);

%zmiana elipsy na koło o promieniu 1 i  bez DC

[I,Q]=transform(X,Y,Ox,Oy,phi);

% tu mamy już komórki I{i} i Q{i} które są chcianym okręgiem 


%faza okręgu
phase={};
for n = 1:length(I)
    for i=1:length(I{n})
        phase{n}(i)=atan2(Q{n}(i),I{n}(i));
    end
    %unwrapping
    phase{n}=unwrap(phase{n});
end

figure(1)
grid on;
hold on;
plot(tc{2},'bo');
plot(phase{2},'r');
plot(theta_tab{2},'yx');
% plot(tc{2}-phase{2},'rx') % bład między tc a phase

figure(2);
grid on;
hold on;
scatter(X{2},Y{2},'r');
plot(Ox(2),Oy(2),'bo');
scatter(I{2},Q{2},'y');
