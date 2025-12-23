clear; clc; close all;
x=[];
y=[];

for p=1:0.1:1.5  
    for n=1:0.1:2
        for t=0.1:0.1:10
            %generowanie sygnału
            [I,Q]=generator(t,n,p);
            x(end+1)=I;
            y(end+1)=Q;
        end
    end
end

Cx=median(x);
Cy=median(y);

Px=x(1:end)-Cx;
Py=y(1:end)-Cy;

Dx=(x(1:end)-Cx).^2;
Dy=(y(1:end)-Cy).^2;

D=sqrt(Dx(1:end)+Dy(1:end));
P=atan2(Py,Px);
% P and D -polar coordinates

P_median=median(P)
[~, P_index] = min(abs(P - P_median));

figure(1)
grid on;
hold on;
scatter(x,y,'bo');
scatter(Cx,Cy,'rx');

figure(2)
grid on;
scatter(P,D,'rx')
hold on;
scatter(P_median,D(P_index),'bo')
hold off

movmean()
figure(3)