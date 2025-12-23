clear; clc;  close all;

x=[]; y=[];
theta=[];
t_=[];
for t=0.1:0.01:20
    T=cos(2*t)+sin(2*t);
    [I,Q]=generato(T);
    x(end+1)=I;
    y(end+1)=Q;
    theta(end+1)=unwrap(atan2(Q,I));
    t_(end+1)=T;
end


[coeff,Ox,Oy,phi]=coef(x,y);
[I,Q]=transfor(x,y,Ox,Oy,phi);

% faza okręgu
phase=[];
for i = 1:length(I)
    phase(i)=atan2(Q(i),I(i));
    phase=unwrap(phase);
end

figure(1)
hold on;
grid on;
scatter(x,y,'ro');
scatter(I,Q,'bo')


x_axis=linspace(0.1,20,length(t_));


figure(2)
hold on;
grid on;
plot(t_,x_axis,phase,x_axis,'r');
legend({'fi(t) - przesunięcie obiektu','faza okręgu przekształconego'},'Location','southwest')