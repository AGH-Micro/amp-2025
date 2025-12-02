function [is_repeat, num_loops] = check(t, theta)

persistent last_theta phase_accum loop_count

%to mi chat napisał , to jest jeszcze do dopracowania.
%to wykrywa przy kalibracji ponowne pojawienie się fazy


if isempty(last_theta)
    last_theta = theta;
    phase_accum = 0;
    loop_count = 0;
end

% zmiana fazy między kolejnymi punktami
dtheta = wrapTo2Pi(theta - last_theta);

% poprawiamy, żeby uwzględnić cofanie się fazy
if dtheta > pi
    dtheta = dtheta - 2*pi;
elseif dtheta < -pi
    dtheta = dtheta + 2*pi;
end

phase_accum = phase_accum + dtheta;
last_theta = theta;

is_repeat = false;
num_loops = loop_count;

% sprawdzamy, czy zgromadziliśmy pełny obrót
if abs(phase_accum) >= 2*pi
    loop_count = loop_count + 1;
    is_repeat = true;
    phase_accum = phase_accum - sign(phase_accum)*2*pi;  % pozostaje nadmiar
end

end
